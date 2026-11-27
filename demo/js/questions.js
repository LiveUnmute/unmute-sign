// The clinical intake.
//
// Each question declares the vocabulary the recogniser is allowed to return.
// That constraint is the core architectural idea: the model never has to
// understand sign language in general, only the answers this question can
// possibly take.

export const CONCEPTS = {
  "1": { label: "1", spoken: "one" },
  "2": { label: "2", spoken: "two" },
  "3": { label: "3", spoken: "three" },
  "4": { label: "4", spoken: "four" },
  "5": { label: "5", spoken: "five" },
  yes: { label: "Yes", spoken: "yes" },
  no: { label: "No", spoken: "no" },
  not_sure: { label: "Not sure", spoken: "not sure" },
};

const YES_NO = ["yes", "no", "not_sure"];

export const QUESTIONS = [
  {
    id: "pain",
    label: "Pain level",
    prompt: "How bad is the pain, from 1 to 5?",
    clinicianHint: "Patient signs a number, 1 to 5",
    allowed: ["1", "2", "3", "4", "5"],
    format: (v) => `${v} / 5`,
    severity: (v) => (Number(v) >= 4 ? "severe" : Number(v) >= 3 ? "moderate" : "mild"),
  },
  {
    id: "understood",
    label: "Understood the explanation",
    prompt: "Do you understand what the doctor told you?",
    clinicianHint: "Thumb up for yes, thumb down for no, open palm for not sure",
    allowed: YES_NO,
    format: (v) => CONCEPTS[v].label,
    flag: (v) => (v === "no" ? "Needs the explanation repeated" : null),
  },
  {
    id: "first_visit",
    label: "First visit for this problem",
    prompt: "Is this your first visit for this problem?",
    clinicianHint: "Thumb up for yes, thumb down for no, open palm for not sure",
    allowed: YES_NO,
    format: (v) => CONCEPTS[v].label,
  },
  {
    id: "interpreter",
    label: "Interpreter needed for next conversation",
    prompt: "Do you need an interpreter for the next conversation?",
    clinicianHint: "Thumb up for yes, thumb down for no, open palm for not sure",
    allowed: YES_NO,
    format: (v) => CONCEPTS[v].label,
    flag: (v) => (v === "yes" ? "Qualified interpreter required — Unmute does not cover this" : null),
    emphasis: true,
  },
];
