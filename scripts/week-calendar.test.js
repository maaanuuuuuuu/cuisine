import test from "node:test";
import assert from "node:assert/strict";
import { calendarErrors, currentWeek, currentWeekErrors, weekForDate, addDays } from "./week-calendar.js";

function fixture(date) {
  const week = weekForDate(date);
  return { ...week, days: Array.from({ length: 7 }, (_, index) => ({
    date: addDays(week.start_date, index),
    meals: [
      ...([2, 5, 6].includes(index) ? [{ type: "lunch" }] : []),
      { type: "dinner" }
    ]
  })) };
}

test("choisit septembre malgré un historique arrêté en août", () => {
  const now = new Date("2026-09-07T06:00:00Z");
  assert.deepEqual(currentWeek(now), {
    week: "2026-W37", start_date: "2026-09-07", end_date: "2026-09-13"
  });
  assert.equal(currentWeekErrors(fixture("2026-08-03"), now).length, 1);
  assert.deepEqual(currentWeekErrors(fixture("2026-09-07"), now), []);
  assert.equal(currentWeekErrors(fixture("2026-09-14"), now).length, 1);
  assert.equal(currentWeekErrors({ days: [] }, now).length, 1);
});

test("change de semaine à minuit à Paris, même si UTC est encore dimanche", () => {
  assert.equal(currentWeek(new Date("2026-09-06T21:59:59Z")).week, "2026-W36");
  assert.equal(currentWeek(new Date("2026-09-06T22:00:00Z")).week, "2026-W37");
  assert.equal(currentWeek(new Date("2026-01-04T22:59:59Z")).week, "2026-W01");
  assert.equal(currentWeek(new Date("2026-01-04T23:00:00Z")).week, "2026-W02");
});

test("gère les années ISO et les semaines 53", () => {
  assert.deepEqual(weekForDate("2027-01-01"), {
    week: "2026-W53", start_date: "2026-12-28", end_date: "2027-01-03"
  });
  assert.equal(weekForDate("2025-12-29").week, "2026-W01");
  assert.equal(weekForDate("2027-01-04").week, "2027-W01");
});

test("rejette les dates impossibles", () => {
  assert.throws(() => weekForDate("2026-02-30"), /invalide/);
  assert.throws(() => weekForDate("07/09/2026"), /invalide/);
});

test("valide aussi les archives sans exiger leur actualité", () => {
  assert.deepEqual(calendarErrors(fixture("2026-08-03")), []);
});

test("détecte un mauvais numéro, une mauvaise fin et un jour dupliqué", () => {
  const week = fixture("2026-09-07");
  week.week = "2026-W32";
  week.end_date = "2026-09-14";
  week.days[1].date = week.days[0].date;
  assert.equal(calendarErrors(week).length, 3);
});

test("exige le dîner du mercredi et les déjeuners aux bons jours", () => {
  const week = fixture("2026-09-07");
  week.days[2].meals = [{ type: "lunch" }];
  week.days[0].meals.push({ type: "lunch" });
  assert.equal(calendarErrors(week).length, 2);
});
