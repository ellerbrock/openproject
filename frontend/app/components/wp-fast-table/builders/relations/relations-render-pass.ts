import {PrimaryRenderPass, RenderedRow, SecondaryRenderPass} from '../primary-render-pass';
import {WorkPackageTable} from '../../wp-fast-table';
import {WorkPackageTableRelationColumnsService} from '../../state/wp-table-relation-columns.service';
import {$injectFields} from '../../../angular/angular-injector-bridge.functions';
import {WorkPackageTableColumnsService} from '../../state/wp-table-columns.service';
import {WorkPackageRelationsService} from '../../../wp-relations/wp-relations.service';
import {relationGroupClass, RelationRowBuilder} from './relation-row-builder';
import {RelationResource} from '../../../api/api-v3/hal-resources/relation-resource.service';
import {rowId} from '../../helpers/wp-table-row-helpers';

export class RelationsRenderPass implements SecondaryRenderPass {
  public wpRelations:WorkPackageRelationsService;
  public wpTableColumns:WorkPackageTableColumnsService;
  public wpTableRelationColumns:WorkPackageTableRelationColumnsService;

  public relationRowBuilder:RelationRowBuilder;

  constructor(private table:WorkPackageTable, private tablePass:PrimaryRenderPass) {
    $injectFields(this, 'wpRelations', 'wpTableColumns', 'wpTableRelationColumns');

    this.relationRowBuilder = new RelationRowBuilder(table);
  }

  public render() {
    // If no relation column active, skip this pass
    if (!this.isApplicable) {
      return;
    }

    // Render into timeline fragment
    this.tablePass.renderedOrder.forEach((row:RenderedRow, position:number) => {

      // We only care for rows that are natural work packages
      if (!(row.isWorkPackage && row.belongsTo)) {
        return;
      }

      // If the work package has no relations, ignore
      const fromId = row.belongsTo.id;
      const state = this.wpRelations.relationState(fromId);
      if (!state.hasValue() || _.size(state.value)) {
        return;
      }

      _.each(this.wpTableRelationColumns.relationsToExtendFor(row.belongsTo, state.value!), (relation) => {

        // Build each relation row (currently sorted by order defined in API)
        const [relationRow,] = this.relationRowBuilder.buildEmptyRelationRow(relation);

        // Augment any data for the belonging work package row to it
        this.tablePass.augmentSecondaryElement(relationRow, row);

        // Insert next to the work package row
        const target = jQuery(this.tablePass.tableBody).find(`${rowId(fromId)},${relationGroupClass(fromId)}`).last();
        target.after(relationRow);

        // Splice the renderedRow with that data
        this.tablePass.renderedOrder.splice(position + 1, 0, {
          isWorkPackage: false,
          belongsTo: row.belongsTo,
          hidden: row.hidden,
        });
      });
    });
  }

  private buildRelationRowsFor(row:RenderedRow, relation:RelationResource) {
  }

  private get isApplicable() {
    return this.wpTableColumns.hasRelationColumns();
  }
}
