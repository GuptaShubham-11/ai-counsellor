import { db } from '@/lib/db';
import { onboardingForms } from '@/lib/db/schema';
import { updateOnboardingFormSchema } from '@/lib/validation/onboarding-form';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqData = await request.json();
    const validatedData = updateOnboardingFormSchema.safeParse(reqData);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { academic, budget, exams, goals, isComplete } = validatedData.data;

    const updateData: any = {};

    if (academic) updateData.academic = JSON.stringify(academic);
    if (budget) updateData.budget = JSON.stringify(budget);
    if (exams) updateData.exams = JSON.stringify(exams);
    if (goals) updateData.goals = JSON.stringify(goals);
    if (isComplete) updateData.isComplete = isComplete;

    const updated = await db
      .update(onboardingForms)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(onboardingForms.userId, session.user.id))
      .returning({
        id: onboardingForms.id,
        academic: onboardingForms.academic,
        goals: onboardingForms.goals,
        budget: onboardingForms.budget,
        exams: onboardingForms.exams,
        isComplete: onboardingForms.isComplete,
        createdAt: onboardingForms.createdAt,
        updatedAt: onboardingForms.updatedAt,
      });

    return NextResponse.json(
      {
        data: updated[0] ?? null,
        message: 'Onboarding form updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update onboarding form error:', error);
    return NextResponse.json(
      { error: 'Update onboarding form error!' },
      { status: 500 }
    );
  }
}
