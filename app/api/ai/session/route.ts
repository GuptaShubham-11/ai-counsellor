import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const aiSession = await db
      .select({
        id: aiSessions.id,
        onboardingFormId: aiSessions.onboardingFormId,
        profileSummary: aiSessions.profileSummary,
        isProfileChanged: aiSessions.isProfileChanged,
        createdAt: aiSessions.createdAt,
        updatedAt: aiSessions.updatedAt,
      })
      .from(aiSessions)
      .where(eq(aiSessions.userId, userId))
      .limit(1);

    return NextResponse.json(
      { data: aiSession[0], message: 'Session fetched successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: 'Session fetch failed!' },
      { status: 500 }
    );
  }
}
