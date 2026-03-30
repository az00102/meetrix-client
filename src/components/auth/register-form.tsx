"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";

import { registerUser } from "@/lib/auth-api";
import { AuthField } from "@/components/auth/auth-field";
import { useAuthSession } from "@/components/shared/auth-session-provider";
import { Button } from "@/components/ui/button";

function RegisterForm() {
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
    const firstName = String(formData.get("first-name") ?? "").trim();
    const lastName = String(formData.get("last-name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm-password") ?? "");

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerUser({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });

      markAuthenticated();
      setSuccessMessage(result.message);
      router.replace("/");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create your account right now.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="first-name"
            label="First name"
            placeholder="John"
            autoComplete="given-name"
          />
          <AuthField
            id="last-name"
            label="Last name"
            placeholder="Doe"
            autoComplete="family-name"
          />
        </div>

        <AuthField
          id="email"
          label="Work email"
          type="email"
          placeholder="john@company.com"
          autoComplete="email"
        />

        <AuthField
          id="organization"
          label="Organization"
          placeholder="Meetrix Labs"
          autoComplete="organization"
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="Create a secure password"
          autoComplete="new-password"
        />

        <AuthField
          id="confirm-password"
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
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
          {isSubmitting ? "Creating account..." : "Create account"}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </form>
    </>
  );
}

export { RegisterForm };
