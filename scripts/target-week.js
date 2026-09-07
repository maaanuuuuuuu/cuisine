import { currentWeek, parisDate } from "./week-calendar.js";

const now = new Date();
console.log(JSON.stringify({
  today: parisDate(now),
  timezone: "Europe/Paris",
  ...currentWeek(now)
}, null, 2));
