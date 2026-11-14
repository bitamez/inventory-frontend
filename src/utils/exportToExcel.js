import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename, footerData = null) => {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const exportData = [...data];

  if (footerData) {
    exportData.push({});
    
    const firstKey = Object.keys(exportData[0])[0];
    
    const preparedRow = {};
    preparedRow[firstKey] = `Prepared by: ${footerData.preparedBy || '________________________'}`;
    exportData.push(preparedRow);

    const approvedRow = {};
    approvedRow[firstKey] = `Approved by: ${footerData.approvedBy || '________________________'}`;
    exportData.push(approvedRow);
  }

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  const timeStr = new Date().toLocaleTimeString('en-GB').replace(/:/g, '-');
  XLSX.writeFile(workbook, `${filename}_${timeStr}.xlsx`);
};
