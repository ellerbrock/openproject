import {WorkPackageTableSelection} from "../../state/wp-table-selection.service";
import {CellBuilder} from "../cell-builder";
import {DetailsLinkBuilder} from "../details-link-builder";
import {$injectFields} from "../../../angular/angular-injector-bridge.functions";
import {
  WorkPackageResource,
  WorkPackageResourceInterface
} from "../../../api/api-v3/hal-resources/work-package-resource.service";
import {WorkPackageTableColumnsService} from "../../state/wp-table-columns.service";
import {QueryColumn} from "../../../api/api-v3/hal-resources/query-resource.service";
import {checkedClassName, UiStateLinkBuilder} from "../ui-state-link-builder";
import {rowId} from "../../helpers/wp-table-row-helpers";
import {Observable} from "rxjs";
import {WorkPackageTable} from "../../wp-fast-table";
import {queryColumnTypes} from '../../../wp-query/query-column';
import {RelationCellbuilder} from '../relation-cell-builder';
import {commonRowClassName, rowClassName, SingleRowBuilder} from '../rows/single-row-builder';
import {RelationResource} from '../../../api/api-v3/hal-resources/relation-resource.service';


export function relationGroupClass(workPackageId:string) {
  return `__relations-expanded-from-${workPackageId}`;
}

export const internalDetailsColumn = {
  id: '__internal-detailsLink'
} as QueryColumn;

export class RelationRowBuilder extends SingleRowBuilder {
  public uiStateBuilder:UiStateLinkBuilder;

  constructor(protected workPackageTable:WorkPackageTable) {
    super(workPackageTable);
    $injectFields(this, 'uiStateBuilder');
  }

  /**
   * Build the columns on the given empty row
   */
  public buildEmptyRelationRow(relation:RelationResource):[HTMLElement, boolean] {
    const tr = this.createEmptyRelationRow(relation.from, relation.to);
    const columns = this.wpTableColumns.getColumns();

    // Set available information for ID and subject column
    // and print hierarchy indicator at subject field.
    columns.forEach((column:QueryColumn) => {
      const td = document.createElement('td');

      if (column.id === 'subject') {
        const textNode = document.createTextNode(`(${relation.type}: ${relation.name}`);
        td.appendChild(textNode);
      }

      if (column.id === 'id') {
        const link = this.uiStateBuilder.linkToShow(
          relation.to.id,
          relation.to.name,
          relation.to.id
        );

        td.appendChild(link);
        td.classList.add('relation-row--id-cell');
      }

      tr.appendChild(td);
    });

    // Append details icon
    const td = document.createElement('td');
    tr.appendChild(td);

    return [tr, false];
  }

  /**
   * Create an empty unattached row element for the given work package
   * @param workPackage
   * @returns {any}
   */
  public createEmptyRelationRow(from:WorkPackageResource, to:WorkPackageResource) {
    let tr = document.createElement('tr');
    tr.dataset['relatedworkPackageId'] = from.id;
    tr.dataset['workPackageId'] = from.id;
    tr.classList.add(
      rowClassName, commonRowClassName, 'issue',
      `wp-table--relations-aditional-row`, relationGroupClass(from.id)
    );

    return tr;
  }
}
