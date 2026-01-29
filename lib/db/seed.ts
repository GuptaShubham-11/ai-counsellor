import { db } from './index';
import { nanoid } from 'nanoid';

import {
  users,
  onboardingForms,
  aiSessions,
  aiMessages,
  universities,
  courses,
  lockedUniversities,
  todos,
  applications,
} from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // ---------- USERS ----------
  const user1Id = nanoid();
  const user2Id = nanoid();

  await db.insert(users).values([
    {
      id: user1Id,
      name: 'Shubham Gupta',
      email: 'shubham@student.com',
      password: 'hashed_password',
      subscription: true,
    },
    {
      id: user2Id,
      name: 'Riya Sharma',
      email: 'riya@student.com',
      password: 'hashed_password',
      subscription: false,
    },
  ]);

  // ---------- ONBOARDING ----------
  const form1Id = nanoid();
  const form2Id = nanoid();

  await db.insert(onboardingForms).values([
    {
      id: form1Id,
      userId: user1Id,
      academic: JSON.stringify({
        education: 'B.Tech',
        major: 'Computer Science',
        graduationYear: 2025,
        gpa: 7.9,
      }),
      goals: JSON.stringify({
        intendedDegree: 'Master',
        field: 'Computer Science',
        intake: 2026,
        countries: ['USA', 'Canada'],
      }),
      budget: JSON.stringify({
        yearlyBudget: 30000,
        funding: 'loan',
      }),
      exams: JSON.stringify({
        ielts: 'planned',
        gre: 'not_started',
        sop: 'not_started',
      }),
      isComplete: true,
    },
    {
      id: form2Id,
      userId: user2Id,
      academic: JSON.stringify({
        education: 'B.Sc',
        major: 'Biotechnology',
        graduationYear: 2024,
        gpa: 8.4,
      }),
      goals: JSON.stringify({
        intendedDegree: 'Master',
        field: 'Biotechnology',
        intake: 2026,
        countries: ['Germany'],
      }),
      budget: JSON.stringify({
        yearlyBudget: 18000,
        funding: 'self',
      }),
      exams: JSON.stringify({
        ielts: 'completed',
        gre: 'not_required',
        sop: 'draft',
      }),
      isComplete: true,
    },
  ]);

  // ---------- AI SESSIONS ----------
  const ai1 = nanoid();
  const ai2 = nanoid();

  await db.insert(aiSessions).values([
    {
      id: ai1,
      userId: user1Id,
      onboardingFormId: form1Id,
      profileSummary:
        'Strong CS background, good GPA, needs IELTS + SOP. Targeting USA & Canada.',
    },
    {
      id: ai2,
      userId: user2Id,
      onboardingFormId: form2Id,
      profileSummary:
        'Strong biotech profile, IELTS completed, good chance for German universities.',
    },
  ]);

  // ---------- AI MESSAGES ----------
  await db.insert(aiMessages).values([
    {
      id: nanoid(),
      aiSessionId: ai1,
      role: 'user',
      content: 'Suggest good universities for MS in CS in USA',
    },
    {
      id: nanoid(),
      aiSessionId: ai1,
      role: 'ai',
      content:
        'Based on your GPA and budget, I recommend University of Texas Arlington, Northeastern University, and University of Florida.',
    },
  ]);

  // ---------- UNIVERSITIES ----------
  const utaId = nanoid();
  const neuId = nanoid();
  const tumId = nanoid();

  await db.insert(universities).values([
    {
      id: utaId,
      name: 'University of Texas at Arlington',
      country: 'USA',
      description:
        'Public research university in Texas with strong CS programs.',
      grade: 'A',
      rating: 4,
    },
    {
      id: neuId,
      name: 'Northeastern University',
      country: 'USA',
      description:
        'Private research university known for co-op and industry connections.',
      grade: 'A+',
      rating: 5,
    },
    {
      id: tumId,
      name: 'Technical University of Munich',
      country: 'Germany',
      description: 'Top-ranked technical university in Germany.',
      grade: 'A+',
      rating: 5,
    },
  ]);

  // ---------- COURSES ----------
  await db.insert(courses).values([
    {
      id: nanoid(),
      universityId: utaId,
      name: 'MS in Computer Science',
      degree: 'master',
      duration: 24,
      tuitionFee: 28000,
    },
    {
      id: nanoid(),
      universityId: neuId,
      name: 'MS in Computer Science',
      degree: 'master',
      duration: 24,
      tuitionFee: 45000,
    },
    {
      id: nanoid(),
      universityId: tumId,
      name: 'MSc in Biotechnology',
      degree: 'master',
      duration: 24,
      tuitionFee: 0,
    },
  ]);

  // ---------- LOCKED UNIVERSITY ----------
  await db.insert(lockedUniversities).values([
    {
      id: nanoid(),
      userId: user1Id,
      universityId: utaId,
      status: 'locked',
    },
  ]);

  // ---------- TODOS ----------
  await db.insert(todos).values([
    {
      id: nanoid(),
      userId: user1Id,
      createdBy: 'ai',
      title: 'Prepare Statement of Purpose',
      description: 'Draft SOP for MS in CS application.',
      status: 'pending',
    },
    {
      id: nanoid(),
      userId: user1Id,
      createdBy: 'ai',
      title: 'Register for IELTS exam',
      description: 'Book exam slot within next 10 days.',
      status: 'pending',
    },
  ]);

  // ---------- APPLICATION ----------
  await db.insert(applications).values([
    {
      id: nanoid(),
      userId: user1Id,
      universityId: utaId,
      status: 'in_progress',
    },
  ]);

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
