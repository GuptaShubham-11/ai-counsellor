import { db } from '@/lib/db';
import { onboardingForms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const onboardingForm = await db
      .select({
        id: onboardingForms.id,
        academic: onboardingForms.academic,
        goals: onboardingForms.goals,
        budget: onboardingForms.budget,
        exams: onboardingForms.exams,
        isComplete: onboardingForms.isComplete,
        createdAt: onboardingForms.createdAt,
        updatedAt: onboardingForms.updatedAt,
      })
      .from(onboardingForms)
      .where(eq(onboardingForms.userId, userId))
      .limit(1);

    const data = onboardingForm[0];

    if (!data) {
      return NextResponse.json(
        { data: null, message: 'Onboarding not started yet' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...data,
          academic: JSON.parse(data.academic),
          goals: JSON.parse(data.goals),
          budget: JSON.parse(data.budget),
          exams: JSON.parse(data.exams),
        },
        message: 'Onboarding fetched successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding fetch error:', error);
    return NextResponse.json(
      { error: 'Get onboarding form failed!' },
      { status: 500 }
    );
  }
}
