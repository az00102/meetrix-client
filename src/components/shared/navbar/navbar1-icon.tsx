import { Book, Sunset, Trees, Zap } from "lucide-react";

import type { NavbarIcon } from "./navbar1.types";

const iconMap = {
  book: Book,
  sunset: Sunset,
  trees: Trees,
  zap: Zap,
} satisfies Record<NavbarIcon, typeof Book>;

function NavbarMenuIcon({
  icon,
  className,
}: {
  icon: NavbarIcon;
  className?: string;
}) {
  const Icon = iconMap[icon];

  return <Icon className={className} />;
}

export { NavbarMenuIcon };
