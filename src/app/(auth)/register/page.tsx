import Link from "next/link";
import { CheckCircle2Icon, ShieldCheckIcon } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";

const highlights = [
  "Create and manage events in one place",
  "Track guests, schedules, and registrations",
  "Collaborate with your team in real time",
];

function RegisterPage() {
  return (
    <main className="flex flex-1 items-center bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-between gap-10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_32%),linear-gradient(135deg,rgba(20,20,20,0.98),rgba(45,45,45,0.94))] p-8 text-white sm:p-10 lg:p-12 dark:bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.22),transparent_32%),linear-gradient(135deg,rgba(12,12,12,1),rgba(32,32,32,0.96))]">
          <div className="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-white/72">
            <ShieldCheckIcon className="size-4" />
            Meetrix Access
          </div>

          <div className="max-w-xl space-y-6">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.14em] text-white/80 uppercase backdrop-blur">
              Registration
            </span>
            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Launch your next event with a clean registration workflow.
              </h1>
              <p className="max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                Create your account to start planning events, organizing
                attendees, and keeping every detail in one calm, shared space.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-sm"
              >
                <CheckCircle2Icon className="size-5 shrink-0 text-[#f2c94c]" />
                <span className="text-sm text-white/88">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center bg-card p-6 sm:p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Create your account
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Fill in your details below to get started with Meetrix.
              </p>
            </div>

            <RegisterForm />

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default RegisterPage;
