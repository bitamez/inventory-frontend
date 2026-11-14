import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (data, filename, title, footerData = null) => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(title, 14, 22);

  const columns = Object.keys(data[0]).map(key => ({ header: key, dataKey: key }));
  const rows = data;

  autoTable(doc, {
    startY: 30,
    head: [columns.map(col => col.header)],
    body: rows.map(row => columns.map(col => row[col.dataKey])),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  if (footerData) {
    const finalY = doc.lastAutoTable.finalY || 30;
    
    doc.setFontSize(11);
    const preparedText = `Prepared by: ${footerData.preparedBy || '________________________'}`;
    const approvedText = `Approved by: ${footerData.approvedBy || '________________________'}`;
    
    if (finalY + 30 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      doc.text(preparedText, 14, 20);
      doc.text(approvedText, 14, 30);
    } else {
      doc.text(preparedText, 14, finalY + 15);
      doc.text(approvedText, 14, finalY + 25);
    }
  }

  const timeStr = new Date().toLocaleTimeString('en-GB').replace(/:/g, '-');
  doc.save(`${filename}_${timeStr}.pdf`);
};
