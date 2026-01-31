import { auth } from '@/lib/auth';
import { createTodoSchema } from '@/lib/validation/todo';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { todos } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqData = await request.json();
    const validatedData = createTodoSchema.safeParse(reqData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description } = validatedData.data;
    const userId = session.user.id;

    const todo = await db
      .insert(todos)
      .values({
        id: nanoid(),
        userId,
        title,
        description,
        createdBy: 'user',
        status: 'pending',
      })
      .returning();

    return NextResponse.json({ data: todo[0] }, { status: 201 });
  } catch (error) {
    console.error('Todo creation error:', error);
    return NextResponse.json({ error: 'Todo creation error' }, { status: 500 });
  }
}
