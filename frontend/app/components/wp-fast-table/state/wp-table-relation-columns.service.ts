// -- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2015 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
// ++

import {TableStateStates, WorkPackageTableBaseService} from "./wp-table-base.service";
import {QueryColumn, QueryResource} from "../../api/api-v3/hal-resources/query-resource.service";
import {opServicesModule} from "../../../angular-modules";
import {States} from "../../states.service";
import {WorkPackageTableTimelineState} from "./../wp-table-timeline";
import {ZoomLevel} from "../../wp-table/timeline/wp-timeline";
import {WorkPackageTableRelationColumns} from '../wp-table-relation-columns';
import {queryColumnTypes} from '../../wp-query/query-column';
import {WorkPackageResourceInterface} from '../../api/api-v3/hal-resources/work-package-resource.service';
import {WorkPackageRelationsService} from '../../wp-relations/wp-relations.service';

export class WorkPackageTableRelationColumnsService extends WorkPackageTableBaseService {
  protected stateName = 'relationColumns' as TableStateStates;

  constructor(public states:States,
              public wpRelations:WorkPackageRelationsService) {
    super(states);
  }

  public initialize(workPackages:WorkPackageResourceInterface[], columns:QueryColumn[]) {

    if (this.isRelationsRequired(columns)) {
      this.wpRelations
        .requireInvolved(workPackages.map(el => el.id))
        .then(() => this.initializeState());
    } else {
      this.initializeState();
    }

  }

  private initializeState() {
    let current = new WorkPackageTableRelationColumns();
    this.state.putValue(current);
  }

  private isRelationsRequired(columns:QueryColumn[]):boolean {
    return !!_.find(columns, (c) => c._type === queryColumnTypes.RELATION);
  }

  private get current() {
    return this.state.value as WorkPackageTableRelationColumns;
  }

}

opServicesModule.service('wpTableRelationColumns', WorkPackageTableRelationColumnsService);
