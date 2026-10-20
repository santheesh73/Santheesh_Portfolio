export const IST_TZ = "Asia/Kolkata";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: IST_TZ,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** "14:05:09" in IST for the given instant. */
export function formatIST(date: Date): string {
  return fmt.format(date);
}
