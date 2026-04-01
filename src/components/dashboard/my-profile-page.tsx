/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import {
  CalendarClockIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";

import { ProfilePageActions } from "@/components/dashboard/profile-page-actions";
import { Button } from "@/components/ui/button";
import type { CurrentUserProfile } from "@/lib/profile-contract";
import { cn } from "@/lib/utils";

function MyProfilePage({
  profile,
  errorMessage,
  errorStatus,
}: {
  profile: CurrentUserProfile | null;
  errorMessage: string | null;
  errorStatus: number | null;
}) {
  if (!profile) {
    return (
      <main className="flex flex-1 bg-background bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_26%)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          {errorStatus === 401 ? (
            <UnauthorizedState message={errorMessage} />
          ) : (
            <ErrorState message={errorMessage} />
          )}
        </div>
      </main>
    );
  }

  const verificationCardClass = profile.emailVerified
    ? ""
    : "border-destructive/25 bg-destructive/10";

  return (
    <main className="flex flex-1 bg-background bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.12),transparent_26%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card/90 p-6 shadow-sm backdrop-blur sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <ShieldCheckIcon className="size-3.5" />
              Dashboard / Settings
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                My profile
              </h1>
            </div>
          </div>

          <ProfilePageActions profile={profile} />
        </section>

        <section
          className={cn(
            "rounded-[2rem] border p-6 shadow-sm sm:p-8",
            verificationCardClass
          )}
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex size-20 items-center justify-center rounded-[1.75rem] border border-border bg-card text-2xl font-semibold tracking-tight text-foreground shadow-sm">
                  {getInitials(profile.name)}
                </div>

                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {profile.name}
                    </h2>
                    <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                      {profile.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{formatEnumValue(profile.status)}</StatusPill>
                    <StatusPill tone={profile.emailVerified ? "verified" : "unverified"}>
                      {profile.emailVerified
                        ? "Email verified"
                        : "Email not verified"}
                    </StatusPill>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProfileInfoBlock
                label="Phone"
                value={profile.phone ?? "No phone added yet"}
                icon={PhoneIcon}
              />
              <ProfileInfoBlock
                label="Role"
                value={formatEnumValue(profile.role)}
                icon={UserRoundIcon}
              />
              <ProfileInfoBlock
                label="Joined"
                value={formatDate(profile.createdAt)}
                icon={CalendarClockIcon}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="rounded-[1.5rem] border border-border bg-card/80 p-5 shadow-sm">
                <div className="flex flex-col gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    About you
                  </h3>
                  <p className="text-sm leading-7 text-foreground">
                    {profile.bio ??
                      "You have not added a bio yet. Use the edit profile form to add one and make this section more personal."}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <ProfileImageCard profile={profile} />
                <DetailRow
                  label="Last updated"
                  value={formatDate(profile.updatedAt)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function UnauthorizedState({ message }: { message: string | null }) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Session required</p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Sign in to view your profile
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {message ??
              "Your session is no longer active. Log in again to load the latest account information."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/login">Go to login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Profile unavailable</p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            We could not load your account details
          </h2>
          <p className="text-sm leading-7 text-muted-foreground sm:text-base">
            {message ?? "Please try again in a moment."}
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </section>
  );
}

function ProfileInfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-border bg-background p-2">
          <Icon className="size-4 text-foreground" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="truncate text-sm font-medium text-foreground sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-sm">
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

function ProfileImageCard({ profile }: { profile: CurrentUserProfile }) {
  return (
    <div className="rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-sm">
      <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Profile image
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex size-14 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold tracking-tight text-foreground">
              {getInitials(profile.name)}
            </span>
          )}
        </div>
        <p className="text-sm leading-6 text-foreground">
          Manage your image from the edit profile modal. Upload wiring is still
          a placeholder for now.
        </p>
      </div>
    </div>
  );
}

function StatusPill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "verified" | "unverified";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.08em] uppercase",
        tone === "default" && "border-border bg-background text-foreground",
        tone === "verified" &&
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "unverified" &&
          "border-destructive/25 bg-destructive/10 text-destructive"
      )}
    >
      {children}
    </span>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function formatEnumValue(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}

export { MyProfilePage };
