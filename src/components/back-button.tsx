"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackButton() {
  return (
    <Button variant="outline" onClick={() => window.history.back()}>
      <ChevronLeft className="h-4 w-4 mr-2" />
      Back
    </Button>
  );
}
