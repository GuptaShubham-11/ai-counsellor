import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { aiSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await request.json();

    const updateData: Partial<{
      profileSummary: string;
      isProfileChanged: boolean;
    }> = {};

    if (typeof body.profileSummary === 'string') {
      updateData.profileSummary = body.profileSummary;
    }

    if (typeof body.isProfileChanged === 'boolean') {
      updateData.isProfileChanged = body.isProfileChanged;
    }

    if (!Object.keys(updateData).length) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updated = await db
      .update(aiSessions)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(aiSessions.userId, userId))
      .returning();

    if (!updated.length) {
      return NextResponse.json(
        { error: 'AI session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: updated[0],
        message: 'AI session updated',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('AI session update error:', error);
    return NextResponse.json(
      { error: 'Session update failed' },
      { status: 500 }
    );
  }
}
