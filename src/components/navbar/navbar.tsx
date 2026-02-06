import { MainNav } from "./main-nav";
import { UserNav } from "./user-nav";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InboxIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export async function Navbar() {
  const session = await getServerSession(authOptions);

  if (!session || !session?.user) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-screen-xl flex h-14 items-center justify-between px-4">
          <Link href="/login" className="flex items-center space-x-2">
            <InboxIcon className="h-6 w-6" />
            <h1 className="text-xl font-bold">DocBox</h1>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background">
      <div className="container mx-auto max-w-screen-xl flex h-16 items-center justify-between py-4 px-4">
        <MainNav />
        <div className="space-x-3">
          <UserNav />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
