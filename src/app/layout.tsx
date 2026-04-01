import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthSessionProvider } from "@/components/shared/auth-session-provider";
import { Footer } from "@/components/shared/footer";
import { Navbar1 } from "@/components/shared/navbar";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { getServerCurrentUserProfile } from "@/lib/server-profile-api";

const AUTH_STATUS_COOKIE = "meetrix-auth-status";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MEETRIX",
  description: "A modern event management platform",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const authStatusCookie = cookieStore.get(AUTH_STATUS_COOKIE)?.value;
  const initialAuthStatus =
    authStatusCookie === "authenticated" ? "authenticated" : "guest";
  const userProfile =
    initialAuthStatus === "authenticated"
      ? (await getServerCurrentUserProfile()).profile
      : null;

  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-screen flex flex-col font-sans">
        <ThemeProvider>
          <AuthSessionProvider initialStatus={initialAuthStatus}>
            <Navbar1 userProfile={userProfile} />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
