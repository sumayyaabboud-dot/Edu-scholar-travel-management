const PDFDocument = require('pdfkit');

// Builds a simple table-style PDF listing applications, and pipes it straight into the HTTP response.
function generateApplicationsPDF(res, title, applications) {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
  doc.pipe(res);

  doc.fontSize(18).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  applications.forEach((app, i) => {
    const studentName = app.student_id?.user_id?.name || 'Unknown';
    const gpa = app.student_id?.gpa ?? 'N/A';
    const university = app.offer_id?.university || 'N/A';

    doc.fontSize(11).text(`${i + 1}. ${studentName}`, { continued: false });
    doc.fontSize(9).fillColor('gray').text(
      `   GPA: ${gpa}   |   University: ${university}   |   Tier: ${app.tier}   |   Status: ${app.status}`
    );
    doc.fillColor('black').moveDown(0.5);
  });

  doc.end();
}

module.exports = { generateApplicationsPDF };