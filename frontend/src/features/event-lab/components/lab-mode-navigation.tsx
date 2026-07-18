import Link from "next/link";

type LabModeNavigationProps = Readonly<{
  activeMode: "foundation" | "advanced";
}>;

const LAB_MODES = [
  {
    id: "foundation",
    href: "/lab",
    label: "Foundation",
    description: "Required task workflow",
  },
  {
    id: "advanced",
    href: "/lab/advanced",
    label: "Advanced",
    description: "Complete task workflow",
  },
] as const;

export function LabModeNavigation({ activeMode }: LabModeNavigationProps) {
  return (
    <nav className="lab-mode-navigation" aria-label="Choose a lab path">
      <p>Choose your path</p>
      <ul>
        {LAB_MODES.map((mode) => (
          <li key={mode.id}>
            <Link href={mode.href} aria-current={activeMode === mode.id ? "page" : undefined}>
              <span>{mode.label}</span>
              <small>{mode.description}</small>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
