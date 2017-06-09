import {PrimaryRenderPass, RenderedRow, SecondaryRenderPass} from '../primary-render-pass';
import {TimelineRowBuilder} from './timeline-row-builder';
import {WorkPackageTable} from '../../wp-fast-table';

export class TimelineRenderPass implements SecondaryRenderPass {
  public I18n:op.I18n;

  /** Row builders */
  protected timelineBuilder:TimelineRowBuilder;

  /** Resulting timeline body */
  public timelineBody:DocumentFragment;

  public render(table:WorkPackageTable, tablePass:PrimaryRenderPass) {
    // Prepare and reset the render pass
    this.timelineBody = document.createDocumentFragment();
    this.timelineBuilder = new TimelineRowBuilder(table);

    // Render into timeline fragment
    tablePass.renderedOrder.forEach((row:RenderedRow) => {
      if (row.isWorkPackage && row.belongsTo) {
        const secondary = this.timelineBuilder.build(row.belongsTo.id);
        tablePass.augmentSecondaryElement(secondary, row);

        this.timelineBody.appendChild(secondary);
      }
    });
  }
}
