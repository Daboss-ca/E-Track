import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

export async function generateRrspDocx(slip: any) {
  try {
    const response = await fetch('/templates/RECEIPT-OF-RETURNED-SEMI-EXPENDABLE-PROPERTY-RRSP-unit-cost-below-50k.docx');
    if (!response.ok) {
      throw new Error('RRSP Template file not found in public/templates/');
    }
    const templateArrayBuffer = await response.arrayBuffer();

    const zip = new PizZip(templateArrayBuffer);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    const mappedItems = (slip.items || []).map((item: any) => ({
      deviceName: item.deviceName || item.description || 'Semi-expendable Item',
      quantity: item.quantity || 1,
      icsNo: item.icsNo || item.propertyNo || 'ICS-2026-998',
      endUser: item.endUser || slip.custodianName || 'Juan Dela Cruz',
      remarks: item.location || item.remarks || 'Office / Laboratory',
    }));

    const data = {
      trackingCode: slip.trackingCode || 'RRSP-2026-000',
      date: slip.date || new Date().toLocaleDateString('en-PH'),
      department: slip.department || 'Cavite State University',
      custodianName: slip.custodianName || '',
      items: mappedItems,
    };

    doc.render(data);

    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    saveAs(out, `RRSP-${slip.trackingCode || 'RRSP'}.docx`);
  } catch (error) {
    console.error('Error generating RRSP Word document:', error);
    alert('Failed to generate RRSP Word document. Please check console for details.');
  }
}

export default generateRrspDocx;