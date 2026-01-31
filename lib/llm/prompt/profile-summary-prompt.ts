export const profileSummaryPrompt = (data: {
  academic: any;
  goals: any;
  budget: any;
  exams: any;
}) => {
  return `
You are an experienced study abroad counsellor.

Your task is to analyze the student's profile and generate a clear, honest, and actionable profile summary.

Student Information:

Academic Background:
- Level: ${data.academic.level}
- Major: ${data.academic.major}
- Graduation Year: ${data.academic.graduationYear}
- GPA/Percentage: ${data.academic.gpa ?? 'Not provided'}

Study Goals:
- Intended Degree: ${data.goals.degree}
- Field of Study: ${data.goals.field}
- Target Intake Year: ${data.goals.intake}
- Preferred Countries: ${data.goals.countries.join(', ')}

Budget:
- Yearly Budget Range: ${data.budget.yearly}
- Funding Plan: ${data.budget.funding}

Exams & Readiness:
- IELTS: ${data.exams.ielts}
- GRE/GMAT: ${data.exams.gre}
- SOP Status: ${data.exams.sop}

Instructions:
- Write in a professional but friendly counselling tone.
- Clearly mention strengths and weaknesses.
- Comment on overall readiness for study abroad.
- Mention any major risks or gaps that must be addressed.
- Keep it concise (5–7 sentences).
- Do NOT suggest universities yet.

Return ONLY the profile summary text.
`;
};
