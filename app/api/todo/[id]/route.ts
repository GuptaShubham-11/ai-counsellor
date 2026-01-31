import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { todos } from '@/lib/db/schema';
import { deleteTodoSchema, updateTodoSchema } from '@/lib/validation/todo';
import { and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: {
    id: string;
  };
};

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validated = deleteTodoSchema.safeParse({ ...params });
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { id } = validated.data;
    const userId = session.user.id;

    const deleted = await db
      .delete(todos)
      .where(
        and(
          eq(todos.id, id),
          eq(todos.userId, userId),
          eq(todos.createdBy, 'user')
        )
      )
      .returning({ id: todos.id });

    if (!deleted.length) {
      return NextResponse.json(
        { error: 'Todo not found or cannot be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: deleted[0].id }, { status: 200 });
  } catch (error) {
    console.error('Todo deletion error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;

    const body = await request.json();
    const validated = updateTodoSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, status } = validated.data;

    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .limit(1);

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (todo.createdBy === 'user') {
      if (title) updateData.title = title;
      if (description) updateData.description = description;
    }

    if (status) updateData.status = status;

    if (!Object.keys(updateData).length) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updated = await db
      .update(todos)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, id))
      .returning();

    return NextResponse.json({ data: updated[0] }, { status: 200 });
  } catch (error) {
    console.error('Todo update error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
