import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { todos } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const todoList = await db
      .select({
        id: todos.id,
        title: todos.title,
        description: todos.description,
        status: todos.status,
        createdBy: todos.createdBy,
        createdAt: todos.createdAt,
        updatedAt: todos.updatedAt,
      })
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(asc(todos.status), asc(todos.createdAt));

    return NextResponse.json({ data: todoList }, { status: 200 });
  } catch (error) {
    console.error('Todo fetch error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
