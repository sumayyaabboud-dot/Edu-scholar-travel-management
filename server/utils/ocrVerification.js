// OCR Verification — documented simplification, see BRD v1.3 Section 13.
// A production version would call Tesseract.js or Google Cloud Vision on the
// uploaded certificate and cross-check the extracted text against the
// self-reported GPA. For this build, the self-reported value is accepted
// directly and marked verified.
function verifyDocument(selfReportedGPA) {
  return {
    verified: true,
    extractedGPA: selfReportedGPA,
    method: 'simplified-auto-accept'
  };
}

module.exports = { verifyDocument };