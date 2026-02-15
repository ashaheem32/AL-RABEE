import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as Omani Riyal (OMR) with 3 decimal places */
export function formatOMR(amount: number): string {
  return `${amount.toFixed(3)} OMR`;
}
