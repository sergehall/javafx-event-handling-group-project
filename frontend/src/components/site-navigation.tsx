"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [
  { href: "/", label: "Home", emphasized: false },
  { href: "/requirements", label: "Requirements", emphasized: false },
  { href: "/materials", label: "Materials", emphasized: false },
  { href: "/lab", label: "Web Lab", emphasized: true },
] as const;

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <>
      <Link className="site-brand" href="/" aria-label="JavaFX Task List home">
        <span className="site-brand__mark" aria-hidden="true">
          J
        </span>
        <span>
          JavaFX <strong>Task List</strong>
        </span>
      </Link>
      <nav aria-label="Primary navigation">
        <ul className="site-nav">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  className={item.emphasized ? "site-nav__launch" : undefined}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
