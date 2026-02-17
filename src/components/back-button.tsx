"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string | null;
  message?: string;
}

export function BackButton({ href, message }: BackButtonProps) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      onClick={() => (href ? router.push(href) : router.back())}>
      <ChevronLeft className="h-4 w-4 mr-2" />
      {message || "Back"}
    </Button>
  );
}
