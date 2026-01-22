import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nullToUndefined<T>(obj: T): any {
  if (obj === null) return undefined;
  if (typeof obj !== "object") return obj;

  return Object.fromEntries(
    Object.entries(obj as Record<string, any>).map(([key, value]) => [
      key,
      nullToUndefined(value),
    ]),
  );
}
