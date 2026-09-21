const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Fixed rulebook-based Q&A — documented simplification, see BRD v1.3 Section 13.
// A production version would call an LLM with a system prompt restricted to
// this same rulebook text. This keeps the exact same "never answer outside
// the rulebook" principle, using keyword matching instead of a live API call.
const RULEBOOK = [
  { keywords: ['partial', 'discount'], answer: 'Partial scholarships receive a 15% discount on the visa fee and 20% on housing. Full scholarships receive 30% and 40%.' },
  { keywords: ['full', 'discount'], answer: 'Full scholarships receive a 30% discount on the visa fee and 40% on housing.' },
  { keywords: ['gpa', 'qualify', 'eligible', 'threshold'], answer: 'A GPA of 86% or above qualifies for a Full scholarship. 70-85% qualifies for Partial. Below 70% is not eligible.' },
  { keywords: ['match score', 'matching'], answer: 'Your AI Match Score combines your GPA (70% weight) and how closely your chosen major matches the scholarship offer (30% weight).' },
  { keywords: ['batch', '50'], answer: 'Donor countries review applications in batches of up to 50 at a time.' }
];

const FALLBACK = "I can only answer questions about scholarship policies from the official rulebook. For anything else, please contact your school coordinator.";

router.post('/ask', authenticate, (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ message: 'A question is required' });
  }

  const lower = question.toLowerCase();
  const match = RULEBOOK.find(entry => entry.keywords.some(k => lower.includes(k)));

  res.json({ answer: match ? match.answer : FALLBACK });
});

module.exports = router;