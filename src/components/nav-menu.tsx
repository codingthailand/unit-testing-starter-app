"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export const NAV_LINKS = [
  { href: "/courses", label: "คอร์สทั้งหมด", testId: "nav-courses" },
  { href: "/free-courses", label: "คอร์สฟรี", testId: "nav-free-courses" },
  { href: "/my-courses", label: "คอร์สของฉัน", testId: "nav-my-courses" },
  { href: "/about", label: "เกี่ยวกับเรา", testId: "nav-about" },
] as const;

export const NavMenu = (props: ComponentProps<typeof NavigationMenu>) => (
  <NavigationMenu {...props}>
    <NavigationMenuList className="data-[orientation=vertical]:-ms-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
      {NAV_LINKS.map((link) => (
        <NavigationMenuItem key={link.href}>
          <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
            <Link data-testid={link.testId} href={link.href}>
              {link.label}
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </NavigationMenuList>
  </NavigationMenu>
);
