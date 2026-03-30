"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { NavbarMenuIcon } from "./navbar1-icon";
import { ThemeToggle } from "./theme-toggle";
import type { MenuItem, NavbarActionLink, NavbarLogo } from "./navbar1.types";

const LOGO_SIZE = 32;

function Navbar1MobileMenu({
  logo,
  menu,
  quickLinks,
  isAuthenticated,
  isLoggingOut,
  onLogout,
}: {
  logo: NavbarLogo;
  menu: MenuItem[];
  quickLinks: NavbarActionLink[];
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  onLogout: () => Promise<void>;
}) {
  return (
    <div className="block lg:hidden">
      <div className="flex items-center justify-between">
        <Link href={logo.url ?? "/"} className="flex items-center gap-2">
          <Image
            src={logo.src}
            alt={logo.alt}
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            unoptimized
            className={cn("h-8 w-auto dark:invert", logo.className)}
          />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                <Link href={logo.url ?? "/"} className="flex items-center gap-2">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={LOGO_SIZE}
                    height={LOGO_SIZE}
                    unoptimized
                    className={cn("h-8 w-auto dark:invert", logo.className)}
                  />
                </Link>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Mobile navigation menu with site links and account actions.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-6 p-4">
              <Accordion
                type="single"
                collapsible
                className="flex w-full flex-col gap-4"
              >
                {menu.map((item) => renderMobileMenuItem(item))}
              </Accordion>

              <div className="flex flex-col gap-3">
                {quickLinks.map((link) => (
                  <Button
                    asChild
                    key={link.title}
                    variant={isAuthenticated ? "outline" : "default"}
                  >
                    <Link href={link.url}>{link.title}</Link>
                  </Button>
                ))}

                {isAuthenticated ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void onLogout()}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </Button>
                ) : null}

                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </Link>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <Link
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      {item.icon ? (
        <div className="text-foreground">
          <NavbarMenuIcon icon={item.icon} className="size-5 shrink-0" />
        </div>
      ) : null}
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description ? (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
};

export { Navbar1MobileMenu };
