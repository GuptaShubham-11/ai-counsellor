import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseList = await db
      .select({
        id: courses.id,
        name: courses.name,
        degree: courses.degree,
        duration: courses.duration,
        tuitionFee: courses.tuitionFee,
      })
      .from(courses);

    if (courseList.length === 0) {
      return NextResponse.json(
        { data: [], message: 'No course found!' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: courseList }, { status: 200 });
  } catch (error) {
    console.log('University fetch error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
