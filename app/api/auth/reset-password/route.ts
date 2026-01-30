import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { resetPasswordSchema } from '@/lib/validation/auth';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const reqData = await request.json();
    console.log();
    

    const validatedData = resetPasswordSchema.safeParse(reqData);
    console.log(validatedData);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, newPassword } = validatedData.data;

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found!' }, { status: 404 });
    }

    const saltRounds = Number(process.env.SALT_ROUNDS ?? 10);
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, email));

    return NextResponse.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.log('Reset Password Error:', error);
    return NextResponse.json(
      { error: 'Reset password failed!' },
      { status: 500 }
    );
  }
}
