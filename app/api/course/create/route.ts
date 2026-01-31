import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { createCourseSchema } from '@/lib/validation/course';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqData = await request.json();
    const validatedData = createCourseSchema.safeParse(reqData);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, universityId, degree, duration, tutionFee } =
      validatedData.data;

    const course = await db
      .insert(courses)
      .values({
        id: nanoid(),
        name,
        universityId,
        degree,
        duration,
        tuitionFee: tutionFee,
      })
      .returning();

    return NextResponse.json({ data: course[0] }, { status: 200 });
  } catch (error) {
    console.log('Course creation error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
