
'use client';

import Link from "next/link";
import { WceLogo } from "@/components/icons";
import { Button } from "../ui/button";
import { PenSquare, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export function Header({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

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
           <Button asChild variant="ghost" size="sm">
              <Link href="/whats-new">
                  What's New
              </Link>
           </Button>
           {isAuthenticated && pathname.startsWith('/update-data') ? (
             <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
             </Button>
           ) : (
             <Button asChild variant="outline" size="sm">
              <Link href="/update-data">
                  <PenSquare className="mr-2 h-4 w-4" />
                  Update Data
              </Link>
            </Button>
           )}
        </div>
      </nav>
    </header>
  );
}
