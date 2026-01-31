import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  aiSessions,
  aiMessages,
  todos,
  lockedUniversities,
  onboardingForms,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { buildPrompt } from '@/lib/llm/prompt/build-prompt';
import { ai } from '@/lib/llm/ai';
import { encode } from '@toon-format/toon';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const userId = session.user.id;

    // 1️⃣ Load onboarding (must be complete)
    const [form] = await db
      .select()
      .from(onboardingForms)
      .where(eq(onboardingForms.userId, userId))
      .limit(1);

    if (!form || !form.isComplete) {
      return NextResponse.json(
        { error: 'Complete onboarding first' },
        { status: 400 }
      );
    }

    const [aiSession] = await db
      .select()
      .from(aiSessions)
      .where(eq(aiSessions.userId, userId))
      .limit(1);

    if (!aiSession) {
      return NextResponse.json(
        { error: 'AI session not initialized' },
        { status: 400 }
      );
    }

    const userTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId));

    const locked = await db
      .select()
      .from(lockedUniversities)
      .where(eq(lockedUniversities.userId, userId));

    const stage =
      locked.length > 0
        ? 'APPLICATION'
        : userTodos.length > 0
          ? 'FINALIZATION'
          : 'DISCOVERY';

    const context = {
      profileSummary: aiSession.profileSummary,
      stage,
      locked: locked.map((u) => u.universityId),
      todos: userTodos.map((t) => t.title),
      message,
    };

    const prompt = buildPrompt(context);

    const aiResult = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: encode(prompt),
    });

    const rawText = aiResult?.text;
    if (!rawText) {
      throw new Error('Empty AI response');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error('AI returned invalid JSON');
    }

    await db.transaction(async (tx) => {
      await tx.insert(aiMessages).values([
        {
          id: nanoid(),
          aiSessionId: aiSession.id,
          role: 'user',
          content: message,
        },
        {
          id: nanoid(),
          aiSessionId: aiSession.id,
          role: 'ai',
          content: parsed.message,
        },
      ]);

      for (const action of parsed.actions || []) {
        if (action.type === 'CREATE_TODO') {
          const exists = userTodos.find((t) => t.title === action.title);
          if (!exists) {
            await tx.insert(todos).values({
              id: nanoid(),
              userId,
              createdBy: 'ai',
              status: 'pending',
              title: action.title,
              description: action.description,
            });
          }
        }

        if (action.type === 'LOCK_UNIVERSITY') {
          const alreadyLocked = locked.find(
            (l) => l.universityId === action.universityId
          );
          if (!alreadyLocked) {
            await tx.insert(lockedUniversities).values({
              id: nanoid(),
              userId,
              universityId: action.universityId,
              status: 'locked',
            });
          }
        }
      }
    });

    return NextResponse.json({
      reply: parsed.message,
      actionsExecuted: parsed.actions || [],
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'AI processing failed' },
      { status: 500 }
    );
  }
}
