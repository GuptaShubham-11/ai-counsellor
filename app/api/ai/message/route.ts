import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiMessages, aiSessions } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
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

    const messages = await db
      .select({
        id: aiMessages.id,
        role: aiMessages.role,
        content: aiMessages.content,
        createdAt: aiMessages.createdAt,
      })
      .from(aiMessages)
      .where(eq(aiMessages.aiSessionId, aiSession[0].id))
      .orderBy(asc(aiMessages.createdAt));

    return NextResponse.json(
      {
        data: messages,
        message: 'Chat history fetched successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Message fetch error:', error);
    return NextResponse.json(
      { error: 'Message fetch failed' },
      { status: 500 }
    );
  }
}
