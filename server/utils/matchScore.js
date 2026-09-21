// AI Match Score — documented simplification, see BRD Section 13.
// Formula: 70% weight on GPA, 30% weight on major fit against the offer's listed majors.
function calculateMatchScore(gpa, studentMajor, offerMajors) {
  const gpaComponent = (gpa / 100) * 70;

  const isExactMajorMatch = offerMajors
    .map(m => m.toLowerCase().trim())
    .includes(studentMajor.toLowerCase().trim());

  const majorComponent = isExactMajorMatch ? 30 : 15; // partial credit if not an exact listed major

  return Math.round(gpaComponent + majorComponent);
}

module.exports = { calculateMatchScore };