"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboardIcon } from "lucide-react";

import { useAuthSession } from "@/components/shared/auth-session-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Navbar1DesktopMenu } from "./navbar1-desktop-menu.client";
import { Navbar1MobileMenu } from "./navbar1-mobile-menu.client";
import { ThemeToggle } from "./theme-toggle";
import { UserAvatarLink } from "./user-avatar-link";
import type {
  MenuItem,
  NavbarActionLink,
  NavbarLogo,
  NavbarUserProfile,
} from "./navbar1.types";

const LOGO_SIZE = 32;

const guestMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Events", url: "/events" },
  { title: "About", url: "#" },
];

const authenticatedMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Events", url: "/events" },
  { title: "Create Event", url: "#" },
];

const guestLinks: NavbarActionLink[] = [
  { title: "Login", url: "/login" },
];

const authenticatedLinks: NavbarActionLink[] = [
  { title: "Dashboard", url: "/dashboard", emphasis: "secondary" },
];

function Navbar1Client({
  logo,
  className,
  userProfile,
}: {
  logo: NavbarLogo;
  className?: string;
  userProfile?: NavbarUserProfile | null;
}) {
  const { logout, status } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const isAuthenticated = status === "authenticated";
  const navbarProfile = userProfile ?? { name: "My Profile", image: null };
  const menu = isAuthenticated ? authenticatedMenu : guestMenu;
  const quickLinks = isAuthenticated ? authenticatedLinks : guestLinks;
  const logoHref = logo.url ?? "/";

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <section
      className={cn(
        "sticky top-0 z-20 bg-background/84 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex w-full sm:px-6 ">
        <nav className="hidden w-full items-center justify-between bg-background/92 px-5 py-3 lg:flex">
          <div className="flex items-center gap-6">
            <Link href={logoHref} className="flex items-center gap-2">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={LOGO_SIZE}
                height={LOGO_SIZE}
                unoptimized
                className={cn("h-8 w-auto dark:invert", logo.className)}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            <Navbar1DesktopMenu menu={menu} />
          </div>

          <div className="flex items-center gap-5">
            {isAuthenticated
              ? quickLinks.map((link) => (
                  <Button
                    asChild
                    key={link.title}
                    size="sm"
                    variant={link.emphasis === "secondary" ? "secondary" : "outline"}
                  >
                    <Link href={link.url}>
                      <LayoutDashboardIcon data-icon="inline-start" />
                      {link.title}
                    </Link>
                  </Button>
                ))
              : quickLinks.map((link) => (
                  <Button asChild key={link.title} size="sm">
                    <Link href={link.url}>{link.title}</Link>
                  </Button>
                ))}

            {isAuthenticated ? (
              <UserAvatarLink profile={navbarProfile} />
            ) : null}

            {isAuthenticated ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            ) : null}

            <ThemeToggle />
          </div>
        </nav>

        <Navbar1MobileMenu
          logo={{ ...logo, url: logoHref }}
          menu={menu}
          quickLinks={quickLinks}
          isAuthenticated={isAuthenticated}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          userProfile={navbarProfile}
        />
      </div>
    </section>
  );
}

export { Navbar1Client };
