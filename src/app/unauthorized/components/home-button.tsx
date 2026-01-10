"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function HomeButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("/")} className="mt-4">
      Go to home
    </Button>
  );
}
