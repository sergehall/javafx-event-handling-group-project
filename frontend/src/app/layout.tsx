import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteNavigation } from "@/components/site-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JavaFX Event Handling",
    template: "%s | JavaFX Event Handling",
  },
  description: "Browser companion and assignment materials for the JavaFX event handling project.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <SiteNavigation />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
