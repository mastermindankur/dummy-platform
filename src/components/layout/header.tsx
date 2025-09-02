import Link from "next/link";
import { WceLogo } from "@/components/icons";

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <nav className="flex w-full items-center gap-6 text-lg font-medium md:text-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <WceLogo className="h-6 w-6 text-primary" />
          <span className="text-nowrap">WCE 2025 Dashboard</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {children}
        </div>
      </nav>
    </header>
  );
}
