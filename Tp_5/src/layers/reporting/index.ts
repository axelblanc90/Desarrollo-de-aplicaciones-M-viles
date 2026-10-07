export * from './ReportTemplate';
export * from './PdfReportGenerator';
export * from './DataExportService';

import { PdfReportGenerator } from './PdfReportGenerator';
import { DataExportService } from './DataExportService';

export class ReportingLayerFacade {
  readonly pdf = new PdfReportGenerator();
  readonly export = DataExportService;
}

export const reportingLayer = new ReportingLayerFacade();
