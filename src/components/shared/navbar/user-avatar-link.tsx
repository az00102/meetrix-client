/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { cn } from "@/lib/utils";

import type { NavbarUserProfile } from "./navbar1.types";

function UserAvatarLink({
  profile,
  className,
}: {
  profile: NavbarUserProfile;
  className?: string;
}) {
  return (
    <Link
      href="/dashboard/settings/myprofile"
      className={cn(
        "inline-flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted",
        className
      )}
      aria-label="Open my profile"
      title="My profile"
    >
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
    </Link>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}

export { UserAvatarLink };
