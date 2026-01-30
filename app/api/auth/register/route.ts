import 'dotenv/config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { registerSchema } from '@/lib/validation/auth';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const reqData = await request.json();

    const validatedData = registerSchema.safeParse(reqData);
    console.log(validatedData);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedData.data;

    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists!' },
        { status: 409 }
      );
    }

    const saltRounds = Number(process.env.SALT_ROUNDS ?? 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.insert(users).values({
      id: nanoid(),
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register Error:', error);
    return NextResponse.json(
      { error: 'Registration failed!' },
      { status: 500 }
    );
  }
}
