'use client';

import {
  IconMail,
  IconLock,
  IconRoadSign,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import React, { FormEvent, useState } from 'react';
import { loginSchema } from '@/lib/validation/auth';
import { Errors, useParseForm } from '@/hooks/use-parse-form';
import { toastManager } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>();
  const [showPassword, setShowPassword] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handlelogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);

    try {
      const rawData = Object.fromEntries(formData);
      const validatedData = useParseForm(rawData, loginSchema);

      if (Object.keys(validatedData.errors).length > 0) {
        setErrors(validatedData.errors);
        setLoading(false);
        return;
      }

      await signIn('credentials', validatedData.data);

      toastManager.add({
        title: 'Account Logined!',
        description: 'You have logined successfully.',
        type: 'success',
      });

      formRef.current?.reset();
      setErrors(undefined);
      setShowPassword(false);
      router.push('/dashboard');
    } catch (error: any) {
      toastManager.add({
        title: 'Login Failed!',
        description: error.response?.data?.error || 'Login failed',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-background-primary font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-sm border border-border backdrop-blur-sm bg-background-secondary">
          <CardContent className="p-8 sm:p-10 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Login to your account
              </h2>
              <p className="text-text-secondary text-sm">
                Welcome back! Please enter your details.
              </p>
            </div>

            <Form ref={formRef} errors={errors} onSubmit={handlelogin}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <Field name="email">
                  <FieldLabel>Email</FieldLabel>
                  <div className="relative w-full">
                    <IconMail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                    <Input
                      disabled={loading}
                      type="email"
                      placeholder="you@email.com"
                      className="pl-6 rounded-sm bg-background-primary"
                    />
                  </div>
                  <FieldError />
                </Field>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full"
              >
                <Field name="password">
                  <div className="flex items-center justify-between w-full -mb-1">
                    <FieldLabel>Password</FieldLabel>
                    <Link
                      href="/auth/reset-password"
                      className="text-sm font-medium text-text-secondary hover:text-text-primary"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative w-full">
                    <IconLock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                    />
                    <Input
                      disabled={loading}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-6 rounded-sm bg-background-primary"
                    />
                    {showPassword ? (
                      <IconEye
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer"
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <IconEyeOff
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary cursor-pointer"
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                  <FieldError />
                </Field>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-2 pt-4 w-full"
              >
                <Button variant="secondary" className="py-4 hover:opacity-80">
                  <Link href="/">Back</Link>
                </Button>

                <Button
                  className="flex-1 group py-4"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <Spinner />
                  ) : (
                    <>
                      Login
                      <IconRoadSign
                        size={18}
                        className="transition-transform group-hover:rotate-45"
                      />
                    </>
                  )}
                </Button>
              </motion.div>
            </Form>

            <p className="text-center text-sm text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-text-primary font-medium hover:underline"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
