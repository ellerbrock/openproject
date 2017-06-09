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

import {opServicesModule} from '../../../angular-modules';
import {States} from '../../states.service';
import {WorkPackageTableRelationColumns} from '../wp-table-relation-columns';
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from '../../api/api-v3/hal-resources/work-package-resource.service';
import {
  RelationsStateValue,
  WorkPackageRelationsService
} from '../../wp-relations/wp-relations.service';
import {WorkPackageTableColumnsService} from './wp-table-columns.service';
import {TableStateStates, WorkPackageTableBaseService} from './wp-table-base.service';
import {RelationResource} from '../../api/api-v3/hal-resources/relation-resource.service';
import {queryColumnTypes} from '../../wp-query/query-column';
import {IQService} from 'angular';
import {HalRequestService} from '../../api/api-v3/hal-request/hal-request.service';
import {WorkPackageCacheService} from '../../work-packages/work-package-cache.service';
import {TypeRelationQueryColumn} from '../../api/api-v3/hal-resources/query-resource.service';

  export class WorkPackageTableRelationColumnsService extends WorkPackageTableBaseService {
  protected stateName = 'relationColumns' as TableStateStates;

  constructor(public states:States,
              public wpTableColumns:WorkPackageTableColumnsService,
              public $q:IQService,
              public halRequest:HalRequestService,
              public wpCacheService:WorkPackageCacheService,
              public wpRelations:WorkPackageRelationsService) {
    super(states);
  }

  public initialize(workPackages:WorkPackageResourceInterface[]) {

    if (this.wpTableColumns.hasRelationColumns()) {
      this.requireInvolved(workPackages.map(el => el.id))
        .then(() => this.initializeState());
    } else {
      this.initializeState();
    }
  }

    /**
     * Returns a subset of all relations that the user has currently expanded.
     *
     * @param workPackage
     * @param relation
     */
  public relationsToExtendFor(workPackage:WorkPackageResource, relations:RelationsStateValue):RelationResource[] {
      // Only if any relation columns or stored expansion state exist
    if (!this.wpTableColumns.hasRelationColumns() || this.state.isPristine()) {
      return [];
    }

    // Only if the work package has anything expanded
    const expanded = this.current.getExpandFor(workPackage.id);
    if (expanded === undefined) {
      return [];
    }

    const column = this.wpTableColumns.findById(expanded)!;

    // Get the type of TO work package
    if (column._type === queryColumnTypes.RELATION) {
      const typeHref = (column as TypeRelationQueryColumn)._links!.type.href;

      return _.filter(relations, (relation:RelationResource) => {
        return relation.workPackageTypes.to === typeHref;
      });
    }

    // TODO fill after relations by relation type
    return [];
  }

  public get current() {
    return this.state.value! as WorkPackageTableRelationColumns;
  }

  private initializeState() {
    let current = new WorkPackageTableRelationColumns();
    this.state.putValue(current);
  }

  /**
   * Requires both the relation resource of the given work package ids as well
   * as the `to` work packages returned from the relations
   */
  private requireInvolved(workPackageIds:string[]) {
    return this.wpRelations
      .requireInvolved(workPackageIds)
      .then((relations) => {
        const involvedIDs = relations.map(relation => [relation.ids.from, relation.ids.to]);
        return this.wpCacheService.loadWorkPackages(
          _.uniq(_.flatten(involvedIDs))
        );
      });
  }
}

opServicesModule.service('wpTableRelationColumns', WorkPackageTableRelationColumnsService);
