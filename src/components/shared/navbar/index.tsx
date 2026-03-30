import { Navbar1Client } from "./navbar1-client";
import type { Navbar1Props } from "./navbar1.types";

const defaultLogo = {
  url: "/",
  src: "/brand_icon.png",
  alt: "logo",
  title: "MEETRIX",
};
const Navbar1 = ({ logo = defaultLogo, className }: Navbar1Props) => (
  <Navbar1Client logo={logo} className={className} />
);

export { Navbar1 };
