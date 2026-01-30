import 'dotenv/config';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { loginSchema } from '@/lib/validation/auth';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET is not defined!');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',

      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials) throw new Error('Missing credentials');

        const validatedData = loginSchema.safeParse(credentials);
        if (!validatedData.success) {
          throw new Error(validatedData.error.issues[0].message);
        }

        const { email, password } = validatedData.data;

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

        if (!user.length) throw new Error('User not found!');

        const isValid = await bcrypt.compare(password, user[0].password);

        if (!isValid) throw new Error('Invalid password!');

        return {
          id: user[0].id,
          name: user[0].name,
          email: user[0].email,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET!,
});
