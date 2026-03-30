"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { AuthField } from "@/components/auth/auth-field";
import { useAuthSession } from "@/components/shared/auth-session-provider";
import { loginUser } from "@/lib/auth-api";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const { markAuthenticated } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setErrorMessage("Please enter both your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({ email, password });
      markAuthenticated();
      setSuccessMessage(result.message);
      router.replace("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign you in right now.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <AuthField
        id="email"
        label="Work email"
        type="email"
        placeholder="john@company.com"
        autoComplete="email"
      />

      <AuthField
        id="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
      />

      {errorMessage ? (
        <p className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}

      <Button className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Login"}
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </form>
  );
}

export { LoginForm };
