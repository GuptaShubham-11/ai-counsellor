import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AnchoredToastProvider, ToastProvider } from '@/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AI Counsellor',
    template: '%s | AI Counsellor',
  },
  description:
    'Plan your study-abroad journey with a guided AI counsellor. Get university recommendations, profile evaluation, and application guidance.',
  applicationName: 'AI Counsellor',
  keywords: [
    'study abroad',
    'ai counsellor',
    'university recommendation',
    'career guidance',
    'student counselling',
  ],
  authors: [{ name: 'AI Counsellor Team' }],
  creator: 'AI Counsellor',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ToastProvider>
          <AnchoredToastProvider>{children}</AnchoredToastProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
