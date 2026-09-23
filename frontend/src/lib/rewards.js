// Logika poin, dimensi, dan lencana. Sumber tunggal untuk backend (rewards.py)
// dan mode demo (store.js) agar hasilnya selalu konsisten.

import { TOPIC_DIM } from "./data";
import { overallScore } from "./util";

export function unlockBadges(user, opts = {}) {
  const owned = new Set(user.badges);
  if (user.streak >= 7) owned.add("streak-7");
  if (user.points >= 1000) owned.add("decider");
  if (user.lessonsDone.length >= 5) owned.add("scholar");
  if (user.doneMissions.length >= 1) owned.add("family-hero");
  if (user.savingCurrent > 0) owned.add("first-saver");
  if (opts.hasExpenses === true) owned.add("tracker");
  else if (opts.hasExpenses === false) owned.delete("tracker");
  const order = ["first-saver", "streak-7", "smart-saver", "tracker", "scholar", "decider", "family-hero"];
  user.badges = order.filter((b) => owned.has(b));
}

export function applyReward(user, points, dim = null, dimUp = 0, opts = {}) {
  user.points += points;
  if (dim && dimUp) user.dims[dim] = Math.min(100, user.dims[dim] + dimUp);
  user.weekly[user.weekly.length - 1] = overallScore(user.dims);
  unlockBadges(user, opts);
  return user;
}

export function shootForDay(user, today) {
  if (user.lastActiveDay !== today) {
    user.streak += 1;
    user.lastActiveDay = today;
  }
  if (user.todayDone < user.todayTotal) user.todayDone += 1;
  return user;
}

export function topicOf(lessonId) {
  const topicsWith = {
    sav1: "saving", sav2: "saving", sav3: "saving",
    sp1: "spending", sp2: "spending", sp3: "spending",
    bd1: "budget", bd2: "budget", bd3: "budget",
    gl1: "goal", gl2: "goal", gl3: "goal",
    rs1: "risk", rs2: "risk", rs3: "risk"
  };
  return topicsWith[lessonId];
}

export function dimOf(lessonId) {
  return TOPIC_DIM[topicOf(lessonId)] || "goal";
}