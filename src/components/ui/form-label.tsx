"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormLabelProps extends React.ComponentProps<typeof Label> {
  required?: boolean;
}

function FormLabel({ className, children, required, ...props }: FormLabelProps) {
  return (
    <Label className={cn(className)} {...props}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </Label>
  );
}

export { FormLabel };
