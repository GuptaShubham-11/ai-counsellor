import { db } from '@/lib/db';
import { onboardingForms } from '@/lib/db/schema';
import { createOnboardingFormSchema } from '@/lib/validation/onboarding-form';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqData = await request.json();
    const validatedData = createOnboardingFormSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { academic, budget, exams, goals } = validatedData.data;

    const userId = session.user.id;

    const existing = await db
      .select({ id: onboardingForms.id })
      .from(onboardingForms)
      .where(eq(onboardingForms.userId, userId))
      .limit(1);

    let onboardingForm;

    if (existing.length) {
      onboardingForm = await db
        .update(onboardingForms)
        .set({
          academic: JSON.stringify(academic),
          budget: JSON.stringify(budget),
          exams: JSON.stringify(exams),
          goals: JSON.stringify(goals),
          updatedAt: new Date(),
        })
        .where(eq(onboardingForms.userId, userId))
        .returning();
    } else {
      onboardingForm = await db
        .insert(onboardingForms)
        .values({
          id: nanoid(),
          userId,
          academic: JSON.stringify(academic),
          budget: JSON.stringify(budget),
          exams: JSON.stringify(exams),
          goals: JSON.stringify(goals),
          isComplete: false,
        })
        .returning();
    }

    return NextResponse.json(
      {
        data: onboardingForm[0],
        message: 'Onboarding form saved successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create onboarding form failed:', error);
    return NextResponse.json(
      { error: 'Create onboarding form failed!' },
      { status: 500 }
    );
  }
}
