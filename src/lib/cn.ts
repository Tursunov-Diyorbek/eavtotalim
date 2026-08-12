/** Minimal className merger — no extra deps. */
export function cn(
  ...parts: Array<string | false | null | undefined | 0 | 0n>
): string {
  return parts.filter(Boolean).join(' ')
}
