import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { onboardingForms } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { encode } from '@toon-format/toon';
import { ai } from '@/lib/llm/ai';
import { profileSummaryPrompt } from '@/lib/llm/prompt/profile-summary-prompt';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const onboarding = await db
      .select({
        academic: onboardingForms.academic,
        goals: onboardingForms.goals,
        budget: onboardingForms.budget,
        exams: onboardingForms.exams,
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

    const parsedOnboarding = {
      academic: JSON.parse(onboarding[0].academic),
      goals: JSON.parse(onboarding[0].goals),
      budget: JSON.parse(onboarding[0].budget),
      exams: JSON.parse(onboarding[0].exams),
    };

    const prompt = profileSummaryPrompt(parsedOnboarding);
    const toonData = encode(prompt);

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: toonData,
    });

    const summary = result.text;

    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to generate profile summary' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: summary,
        message: 'Profile summary generated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile summary fetch error:', error);
    return NextResponse.json(
      { error: 'Profile summary fetch failed!' },
      { status: 500 }
    );
  }
}
