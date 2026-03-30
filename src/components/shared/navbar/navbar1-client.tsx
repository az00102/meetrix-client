"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { useAuthSession } from "@/components/shared/auth-session-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Navbar1DesktopMenu } from "./navbar1-desktop-menu.client";
import { Navbar1MobileMenu } from "./navbar1-mobile-menu.client";
import { ThemeToggle } from "./theme-toggle";
import type { MenuItem, NavbarActionLink, NavbarLogo } from "./navbar1.types";

const LOGO_SIZE = 32;

const guestMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Events", url: "#" },
  { title: "About", url: "#" },
];

const authenticatedMenu: MenuItem[] = [
  { title: "Home", url: "/" },
  { title: "Events", url: "#" },
  { title: "Create Event", url: "#" },
];

const guestLinks: NavbarActionLink[] = [
  { title: "Login", url: "/login" },
];

const authenticatedLinks: NavbarActionLink[] = [
  { title: "Dashboard", url: "#" },
  { title: "Profile", url: "#" },
];

function Navbar1Client({
  logo,
  className,
}: {
  logo: NavbarLogo;
  className?: string;
}) {
  const { logout, status } = useAuthSession();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const isAuthenticated = status === "authenticated";
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
    <section className={cn("flex justify-center p-4", className)}>
      <div className="container flex-row justify-around">
        <nav className="hidden justify-between lg:flex">
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
                  <Link
                    key={link.title}
                    href={link.url}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.title}
                  </Link>
                ))
              : quickLinks.map((link) => (
                  <Button asChild key={link.title} size="sm">
                    <Link href={link.url}>{link.title}</Link>
                  </Button>
                ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-sm font-medium rounded-2xl transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
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
        />
      </div>
    </section>
  );
}

export { Navbar1Client };
