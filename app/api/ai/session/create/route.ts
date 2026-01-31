import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiSessions, onboardingForms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { createAiSessionSchema } from '@/lib/validation/ai';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqData = await request.json();
    const validatedData = createAiSessionSchema.safeParse(reqData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { profileSummary } = validatedData.data;
    const userId = session.user.id;

    const onboarding = await db
      .select({
        id: onboardingForms.id,
        isComplete: onboardingForms.isComplete,
      })
      .from(onboardingForms)
      .where(eq(onboardingForms.userId, userId))
      .limit(1);

    if (!onboarding.length) {
      return NextResponse.json(
        { error: 'Onboarding not found' },
        { status: 404 }
      );
    }

    if (!onboarding[0].isComplete) {
      return NextResponse.json(
        { error: 'Onboarding not completed' },
        { status: 400 }
      );
    }

    const onboardingFormId = onboarding[0].id;

    const existing = await db
      .select({ id: aiSessions.id })
      .from(aiSessions)
      .where(eq(aiSessions.userId, userId))
      .limit(1);

    let aiSession;

    if (existing.length) {
      aiSession = await db
        .update(aiSessions)
        .set({
          isProfileChanged: false,
          updatedAt: new Date(),
        })
        .where(eq(aiSessions.userId, userId))
        .returning();
    } else {
      aiSession = await db
        .insert(aiSessions)
        .values({
          id: nanoid(),
          userId,
          onboardingFormId,
          profileSummary,
          isProfileChanged: false,
        })
        .returning();
    }

    return NextResponse.json(
      {
        data: aiSession[0],
        message: 'AI session ready',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Create AI session error:', error);
    return NextResponse.json(
      { error: 'Failed to create AI session' },
      { status: 500 }
    );
  }
}
