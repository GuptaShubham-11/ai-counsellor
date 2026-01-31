import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiMessages, aiSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const aiSession = await db
      .select({ id: aiSessions.id })
      .from(aiSessions)
      .where(eq(aiSessions.userId, userId))
      .limit(1);

    if (!aiSession.length) {
      return NextResponse.json(
        { error: 'AI session not found' },
        { status: 404 }
      );
    }

    const aiSessionId = aiSession[0].id;

    await db.delete(aiMessages).where(eq(aiMessages.aiSessionId, aiSessionId));

    await db
      .update(aiSessions)
      .set({
        isProfileChanged: false,
        updatedAt: new Date(),
      })
      .where(eq(aiSessions.id, aiSessionId));

    return NextResponse.json(
      { message: 'AI conversation reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('AI reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset AI session' },
      { status: 500 }
    );
  }
}
