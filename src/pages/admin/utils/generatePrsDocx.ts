import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

export interface PrsSlipItem {
  dateAcquired?: string;
  quantity?: number | string;
  unit?: string;
  propertyNo?: string;
  icsNo?: string;
  deviceName?: string;
  description?: string;
  acquisitionCost?: number | string;
}

export interface PrsSlipPayload {
  trackingCode?: string;
  department?: string;
  custodianName?: string;
  items?: PrsSlipItem[];
}

export async function generatePrsDocx(slip: PrsSlipPayload) {
  try {
    const response = await fetch('/templates/PROPERTY-RETURN-SLIP-PRS-unit-cost-50k-and-above.docx');
    if (!response.ok) {
      throw new Error('Template file not found in public/templates/');
    }
    const templateArrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(templateArrayBuffer);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const mappedItems = (slip.items || []).map((item: PrsSlipItem) => ({
      dateAcquired: item.dateAcquired || '2023-05-12',
      quantity: item.quantity || 1,
      unit: item.unit || 'unit',
      propertyNo: item.propertyNo || item.icsNo || 'PRS-2026-001',
      deviceName: item.deviceName || item.description || 'Item Description',
      acquisitionCost: item.acquisitionCost
        ? Number(item.acquisitionCost).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '50,000.00',
    }));

    const data = {
      trackingCode: slip.trackingCode || 'PRS-2026-000',
      department: slip.department || 'Cavite State University',
      custodianName: slip.custodianName || '',
      items: mappedItems,
    };

    doc.render(data);

    const out = doc.getZip().generate({
      type: 'blob',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    saveAs(out, `Property-Return-Slip-${slip.trackingCode || 'PRS'}.docx`);
  } catch (error) {
    console.error('Error generating Word document:', error);
    alert('Failed to generate Word document. Please check console for details.');
  }
}

export default generatePrsDocx;