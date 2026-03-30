export type NavbarIcon = "book" | "sunset" | "trees" | "zap";

export interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: NavbarIcon;
  items?: MenuItem[];
}

export interface NavbarLogo {
  url?: string;
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export interface NavbarActionLink {
  title: string;
  url: string;
}

export interface Navbar1Props {
  className?: string;
  logo?: NavbarLogo;
}
