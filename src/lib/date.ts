// The app's real users are all in Israel — "today" must reset at Israel midnight
// (Asia/Jerusalem), not UTC midnight (Vercel's server timezone). Israel's UTC offset
// varies with DST (+2 in winter, +3 in summer), so a fixed offset would be wrong half the year.
export function startOfDayIsrael(base: Date = new Date()): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(base);
  const guessUtcMidnight = new Date(`${ymd}T00:00:00.000Z`);
  const israelHourAtGuess = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", hour: "2-digit", hour12: false }).format(guessUtcMidnight)
  );
  const offsetHours = israelHourAtGuess % 24;
  return new Date(guessUtcMidnight.getTime() - offsetHours * 3600 * 1000);
}

export function endOfDayIsrael(base: Date = new Date()): Date {
  return new Date(startOfDayIsrael(base).getTime() + 24 * 3600 * 1000 - 1);
}
