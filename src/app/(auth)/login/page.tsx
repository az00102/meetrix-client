import Link from "next/link";
import { CheckCircle2Icon, ShieldCheckIcon } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

const highlights = [
  "Manage registrations, schedules, and event updates in one place.",
  "Use the same workspace across your planning and delivery flow.",
  "Keep your team aligned without switching between scattered tools.",
];

function LoginPage() {
  return (
    <main className="flex flex-1 items-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <section className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            <ShieldCheckIcon className="size-3.5" />
            Secure access
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Login to your Meetrix workspace
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              A clean place to get back to registrations, event planning, and the
              work your team already has in motion.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-muted/35 p-6">
            <div className="flex flex-col gap-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mx-auto flex w-full max-w-md flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">Welcome back</p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Enter your account details
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use your organizer email and password to continue.
              </p>
            </div>

            <LoginForm />

            <p className="text-sm text-muted-foreground">
              Need an account?{" "}
              <Link
                href="/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
