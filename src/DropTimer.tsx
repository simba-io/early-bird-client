const LONDON_TIMEZONE = "Europe/London";
const TUESDAY_WEEKDAY_INDEX = 2;
const SECOND_MS = 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

type DateParts = {
  weekday: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

type DropTimerController = {
  element: HTMLDivElement;
  destroy: () => void;
};

const weekdayIndexMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const londonPartsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: LONDON_TIMEZONE,
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getLondonDateParts(date: Date): DateParts {
  const partMap: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of londonPartsFormatter.formatToParts(date)) {
    if (part.type !== "literal") {
      partMap[part.type] = part.value;
    }
  }

  return {
    weekday: partMap.weekday ?? "Tue",
    year: Number(partMap.year ?? 0),
    month: Number(partMap.month ?? 1),
    day: Number(partMap.day ?? 1),
    hour: Number(partMap.hour ?? 0),
    minute: Number(partMap.minute ?? 0),
    second: Number(partMap.second ?? 0),
  };
}

function getTimeZoneOffsetMs(utcTimestamp: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(utcTimestamp));

  const mapped: Partial<Record<Intl.DateTimeFormatPartTypes, number>> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      mapped[part.type] = Number(part.value);
    }
  }

  const asUtc = Date.UTC(
    mapped.year ?? 0,
    (mapped.month ?? 1) - 1,
    mapped.day ?? 1,
    mapped.hour ?? 0,
    mapped.minute ?? 0,
    mapped.second ?? 0,
  );

  return asUtc - utcTimestamp;
}

function londonLocalToUtcTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
): number {
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  let guess = localAsUtc;

  for (let i = 0; i < 5; i += 1) {
    const offset = getTimeZoneOffsetMs(guess, LONDON_TIMEZONE);
    const resolved = localAsUtc - offset;
    if (Math.abs(resolved - guess) < 500) {
      return resolved;
    }
    guess = resolved;
  }

  return guess;
}

function getNextTuesdayNoonUtc(now: Date): number {
  const londonNow = getLondonDateParts(now);
  const weekday = weekdayIndexMap[londonNow.weekday] ?? TUESDAY_WEEKDAY_INDEX;

  let daysUntilTuesday = (TUESDAY_WEEKDAY_INDEX - weekday + 7) % 7;
  const isPastNoonOnTuesday =
    daysUntilTuesday === 0 &&
    (londonNow.hour > 12 ||
      (londonNow.hour === 12 &&
        (londonNow.minute > 0 || londonNow.second > 0)));

  if (isPastNoonOnTuesday) {
    daysUntilTuesday = 7;
  }

  const startOfLondonDayAsUtc = Date.UTC(
    londonNow.year,
    londonNow.month - 1,
    londonNow.day,
  );
  const targetDayUtc = new Date(
    startOfLondonDayAsUtc + daysUntilTuesday * DAY_MS,
  );

  const targetYear = targetDayUtc.getUTCFullYear();
  const targetMonth = targetDayUtc.getUTCMonth() + 1;
  const targetDay = targetDayUtc.getUTCDate();

  return londonLocalToUtcTimestamp(
    targetYear,
    targetMonth,
    targetDay,
    12,
    0,
    0,
  );
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatCountdown(remainingSeconds: number): string {
  const safeSeconds = Math.max(0, remainingSeconds);
  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return `${pad2(days)}/${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}

export function createDropTimerElement(): DropTimerController {
  const wrapper = document.createElement("div");
  wrapper.id = "drop-timer";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "8px";
  wrapper.style.background = "rgba(15, 23, 42, 0.18)";
  wrapper.style.padding = "8px 10px";
  wrapper.style.borderRadius = "10px";
  wrapper.style.border = "1px solid rgba(255, 255, 255, 0.2)";

  const label = document.createElement("span");
  label.textContent = "Drop:";
  label.style.fontSize = "13px";
  label.style.fontWeight = "700";
  label.style.color = "#dbeafe";

  const value = document.createElement("span");
  value.style.fontSize = "15px";
  value.style.fontWeight = "800";
  value.style.letterSpacing = "0.4px";
  value.style.color = "#ffffff";
  value.textContent = "00/00:00:00";

  wrapper.append(label, value);

  const updateCountdown = () => {
    const now = new Date();
    const targetUtc = getNextTuesdayNoonUtc(now);
    const remainingSeconds = Math.floor(
      (targetUtc - now.getTime()) / SECOND_MS,
    );
    value.textContent = formatCountdown(remainingSeconds);
  };

  updateCountdown();
  const intervalId = window.setInterval(updateCountdown, SECOND_MS);

  return {
    element: wrapper,
    destroy: () => {
      window.clearInterval(intervalId);
    },
  };
}
