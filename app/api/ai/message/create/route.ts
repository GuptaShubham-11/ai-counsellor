import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiMessages, aiSessions } from '@/lib/db/schema';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { createAiMessageSchema } from '@/lib/validation/ai';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqData = await request.json();
    const validatedData = createAiMessageSchema.safeParse(reqData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = validatedData.data;
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

    const aiMessage = await db
      .insert(aiMessages)
      .values({
        id: nanoid(),
        aiSessionId: aiSession[0].id,
        role: 'user',
        content,
      })
      .returning({ id: aiMessages.id });

    return NextResponse.json({ id: aiMessage[0].id }, { status: 201 });
  } catch (error) {
    console.error('Create AI message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
