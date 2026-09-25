const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const StudentProfile = require('../models/StudentProfile');

const QUESTION_LIMIT = 15;
const RESET_WINDOW_MS = 12 * 60 * 60 * 1000; // 12 hours

const RULEBOOK = [
  { keywords: ['partial', 'discount'], mode: 'all', answer: 'Partial scholarships receive a 15% discount on the visa fee and 20% on housing. Full scholarships receive 30% and 40%.' },
  { keywords: ['full', 'discount'], mode: 'all', answer: 'Full scholarships receive a 30% discount on the visa fee and 40% on housing.' },
  { keywords: ['gpa', 'qualify', 'eligible', 'threshold'], mode: 'any', answer: 'A GPA of 86% or above qualifies for a Full scholarship. 70-85% qualifies for Partial. Below 70% is not eligible.' },
  { keywords: ['match score', 'matching'], mode: 'any', answer: 'Your AI Match Score combines your GPA (70% weight) and how closely your chosen major matches the scholarship offer (30% weight).' },
  { keywords: ['batch'], mode: 'any', answer: 'Donor countries review applications in batches of up to 50 at a time.' }
];

const FALLBACK = "I can only answer questions about scholarship policies from the official rulebook. For anything else, please contact your school coordinator.";

// If 12 hours have passed since the last reset, zero the counter and start a fresh window.
// Returns the profile with an up-to-date, correct count — never saves unless a reset was actually due.
async function getFreshProfile(userId) {
  const profile = await StudentProfile.findOne({ user_id: userId });
  if (!profile) return null;

  const elapsed = Date.now() - new Date(profile.questionCountResetAt).getTime();
  if (elapsed >= RESET_WINDOW_MS) {
    profile.questionCount = 0;
    profile.questionCountResetAt = new Date();
    await profile.save();
  }
  return profile;
}

router.get('/usage', authenticate, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.json({ questionCount: 0, limit: QUESTION_LIMIT, resetsAt: null });
  }
  const profile = await getFreshProfile(req.user.userId);
  const resetsAt = profile ? new Date(new Date(profile.questionCountResetAt).getTime() + RESET_WINDOW_MS) : null;
  res.json({ questionCount: profile?.questionCount || 0, limit: QUESTION_LIMIT, resetsAt });
});

router.post('/ask', authenticate, async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ message: 'A question is required' });
  }

  let questionCount = 0;
  let resetsAt = null;

  if (req.user.role === 'student') {
    const profile = await getFreshProfile(req.user.userId);
    if (profile) {
      resetsAt = new Date(new Date(profile.questionCountResetAt).getTime() + RESET_WINDOW_MS);
      if (profile.questionCount >= QUESTION_LIMIT) {
        return res.status(429).json({
          message: `You've reached your limit of ${QUESTION_LIMIT} questions. Try again after ${resetsAt.toLocaleString()}.`,
          questionCount: profile.questionCount,
          limit: QUESTION_LIMIT,
          resetsAt
        });
      }
      profile.questionCount += 1;
      await profile.save();
      questionCount = profile.questionCount;
    }
  }

  const lower = question.toLowerCase();
  const match = RULEBOOK.find((entry) =>
    entry.mode === 'all'
      ? entry.keywords.every((k) => lower.includes(k))
      : entry.keywords.some((k) => lower.includes(k))
  );

  res.json({ answer: match ? match.answer : FALLBACK, questionCount, limit: QUESTION_LIMIT, resetsAt });
});

module.exports = router;