"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface props {
  path: string;
  message: string;
}

export function RedirectButton(props: props) {
  const router = useRouter();

  return (
    <Button onClick={() => router.push(props.path)} className="mt-4">
      {props.message}
    </Button>
  );
}
