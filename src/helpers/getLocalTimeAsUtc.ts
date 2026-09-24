import { formatInTimeZone } from "date-fns-tz";

export function getLocalTimeAsUtc(timezone: string) {
  const now = new Date();

  const localTime = formatInTimeZone(
    now,
    timezone,
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
  );

  return new Date(`${localTime}Z`);
}
