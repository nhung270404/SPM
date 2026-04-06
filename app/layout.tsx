import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AppContextProvider } from '@/context/app-context';
import { IConfig } from "@/models/config.model";
import { ReactNode } from 'react';
import { GetConfig } from '@/lib/services/config.service';
import { ThemeProvider } from '@/components/theme-provider';
import LangLayout from '@/app/lang';
import { UserProvider } from '@/context/user-context';

// [ĐÃ XÓA] Import BackgroundEffect để bỏ hiệu ứng nhấp nháy

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const config: IConfig = await GetConfig();
  return {
    title: config.title || 'SPM',
    description: config.description || 'Powered by NextJS - Author Kot',
  };
}

export default async function RootLayout({
                                           children,
                                         }: Readonly<{
  children: ReactNode;
}>) {
  const config: IConfig = await GetConfig();

  return (
      <html lang="vi" suppressHydrationWarning>

      <body
          suppressHydrationWarning
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>

      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <Toaster />
        <AppContextProvider config={config}>
          <UserProvider>
            <LangLayout>{children}</LangLayout>
          </UserProvider>
        </AppContextProvider>

      </ThemeProvider>
      </body>
      </html>
  );
}