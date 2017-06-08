import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from './../../api/api-v3/hal-resources/work-package-resource.service';
import {DisplayField} from './../../wp-display/wp-display-field/wp-display-field.module';
import {WorkPackageDisplayFieldService} from './../../wp-display/wp-display-field/wp-display-field.service';
import {$injectFields, injectorBridge} from '../../angular/angular-injector-bridge.functions';
import {States} from '../../states.service';
import {tdClassName} from './cell-builder';
import {QueryColumn} from '../../api/api-v3/hal-resources/query-resource.service';
import {
  RelationsStateValue,
  WorkPackageRelationsService
} from '../../wp-relations/wp-relations.service';

export const relationCellTdClassName = 'wp-table--relation-cell-td';
export class RelationCellbuilder {
  public states:States;
  public wpRelations:WorkPackageRelationsService;

  public wpDisplayField:WorkPackageDisplayFieldService;

  constructor() {
    $injectFields(this, 'states', 'wpRelations');
  }

  public build(workPackage:WorkPackageResourceInterface, column:QueryColumn) {
    const td = document.createElement('td');
    td.classList.add(tdClassName, relationCellTdClassName, column.id);

    const counter = document.createElement('span');
    counter.classList.add('wp-table--relation-count');

    const indicator = document.createElement('span')
    indicator.classList.add('wp-table--relation-indicator');
    indicator.innerHTML = `<i class="icon icon-arrow-down1" aria-hidden="true"></i>`;

    const state = this.wpRelations.relationState(workPackage.id).value;
    if (state) {
      counter.textContent = '' + _.size(state);
      counter.classList.add('badge', '-secondary');
      td.appendChild(counter);
      td.appendChild(indicator);
    }

    return td;
  }
}

