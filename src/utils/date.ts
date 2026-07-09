const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface UpcomingDay {
  iso: string;
  dayName: string;
  label: string;
  isToday: boolean;
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function getUpcomingDays(count = 7): UpcomingDay[] {
  const days: UpcomingDay[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      iso: toISODate(d),
      dayName: DAY_NAMES[d.getDay()],
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      isToday: i === 0,
    });
  }
  return days;
}

export function formatDateLong(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export function todayISO(): string {
  return toISODate(new Date());
}
