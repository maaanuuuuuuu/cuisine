const DAY_MS = 86400000;

export function parisDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Date ISO invalide : ${value}`);
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Date ISO invalide : ${value}`);
  }
  return date;
}

export function addDays(value, days) {
  return new Date(parseDate(value).getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export function weekForDate(value) {
  const date = parseDate(value);
  const mondayOffset = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date.getTime() - mondayOffset * DAY_MS);
  const thursday = new Date(monday.getTime() + 3 * DAY_MS);
  const isoYear = thursday.getUTCFullYear();
  const firstDay = new Date(Date.UTC(isoYear, 0, 1));
  const number = Math.ceil(((thursday - firstDay) / DAY_MS + 1) / 7);
  const start = monday.toISOString().slice(0, 10);
  return {
    week: `${isoYear}-W${String(number).padStart(2, "0")}`,
    start_date: start,
    end_date: addDays(start, 6)
  };
}

export function currentWeek(now = new Date()) {
  return weekForDate(parisDate(now));
}

export function calendarErrors(week) {
  if (!week?.week) return ["Identifiant de semaine manquant."];
  let expected;
  try {
    expected = weekForDate(week.start_date);
  } catch (error) {
    return [error.message];
  }
  const errors = [];
  for (const key of ["week", "start_date", "end_date"]) {
    if (week[key] !== expected[key]) errors.push(`${key} : ${expected[key]} attendu, reçu ${week[key]}.`);
  }
  if (!Array.isArray(week.days) || week.days.length !== 7) {
    errors.push("Sept jours du lundi au dimanche sont attendus.");
    return errors;
  }
  week.days.forEach((day, index) => {
    const date = addDays(expected.start_date, index);
    if (day.date !== date) errors.push(`Jour ${index + 1} : ${date} attendu.`);
    const meals = Array.isArray(day.meals) ? day.meals : [];
    const lunchCount = [2, 5, 6].includes(index) ? 1 : 0;
    if (meals.filter((meal) => meal.type === "dinner").length !== 1 ||
        meals.filter((meal) => meal.type === "lunch").length !== lunchCount ||
        meals.length !== 1 + lunchCount) {
      errors.push(`${date} : un dîner et ${lunchCount} déjeuner attendus.`);
    }
  });
  return errors;
}

export function currentWeekErrors(week, now = new Date()) {
  const expected = currentWeek(now);
  return ["week", "start_date", "end_date"].some((key) => week?.[key] !== expected[key])
    ? [`La semaine courante doit être ${expected.week} (${expected.start_date} au ${expected.end_date}, Europe/Paris), reçu ${week?.week ?? "aucune"}.`]
    : [];
}
