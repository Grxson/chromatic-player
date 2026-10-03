/**
 * Format seconds as `m:ss` (or `h:mm:ss` when needed).
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  const padded = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${padded(minutes)}:${padded(remainder)}`;
  }
  return `${minutes}:${padded(remainder)}`;
}
