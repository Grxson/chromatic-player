/**
 * Tiny class-name joiner. Filters falsy values and joins the rest with a
 * single space. Keeps components free of `clsx`/`tailwind-merge`
 * dependencies for the foundation.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
