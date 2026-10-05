// Logika poin, dimensi, dan lencana. Sumber tunggal untuk backend (rewards.py)
// dan mode demo (store.js) agar hasilnya selalu konsisten.

import { CASES, TOPIC_DIM } from "./data";
import { CONTRIB_PTS } from "./family";
import { overallScore } from "./util";

export const QUIZ_CONFIG = {
  quizMax: 15, // jumlah maksimum soal per hari (tidak ditampilkan)
  wrongMax: 5, // batas jawaban salah per hari (ditampilkan)
  bonusCount: 3, // beberapa soal pertama per hari memberi poin penuh
  fullPts: 10, // jawaban benar di awal hari
  latePts: 5, // jawaban benar setelah jatah bonus habis
  wrongPts: 3, // potongan poin saat jawaban salah
  hardPts: 15, // jawaban benar di mode hard
  hardWrongPts: 6, // potongan poin salah di mode hard
  freeGoodPts: 1, // bonus tersembunyi di fase tanpa poin (benar)
  freeBadPts: 1 // pengurang tersembunyi di fase tanpa poin (salah)
};

// Fase kuis: 'intro' (belum mulai) | 'paid' (berpoin) | 'free' (tanpa poin) | 'done'
export function qzState(user, today) {
  const st = user.quizState || {};
  if (st.date === today) return st;
  return { date: today, phase: "intro", paidCount: 0, wrong: 0, count: 0, earned: 0, done: [], freePts: 0 };
}

export function startQuiz(user, today) {
  const st = qzState(user, today);
  st.phase = "paid";
  user.quizState = st;
  return { user };
}

export function continueFree(user, today) {
  const st = qzState(user, today);
  st.phase = "free";
  user.quizState = st;
  return { user };
}

// Menabung hasil fase "tanpa poin" ke poin user; menandai kuis selesai hari ini.
export function finishQuiz(user, today) {
  const st = qzState(user, today);
  const bonus = Math.max(0, st.freePts || 0);
  user.points = Math.max(0, user.points + bonus);
  st.freePts = 0;
  st.phase = "done";
  st.lastBonus = bonus;
  user.quizState = st;
  unlockBadges(user);
  user.weekly[user.weekly.length - 1] = overallScore(user.dims);
  return { user, bonus };
}

export function answerQuiz(user, today, index, optionIndex, hard = false) {
  const caseData = CASES[index % CASES.length];
  const st = qzState(user, today);
  const correct = optionIndex % caseData.options.length === caseData.correct;
  let gained = 0;
  let lost = 0;
  let free = false;

  if (st.phase === "free") {
    // Fase tanpa poin: akumulasi tersembunyi, baru dibank saat "Selesai Quiz".
    free = true;
    st.done.push(index);
    st.freePts = (st.freePts || 0) + (correct ? QUIZ_CONFIG.freeGoodPts : -QUIZ_CONFIG.freeBadPts);
  } else {
    st.done.push(index);
    st.paidCount += 1;
    if (correct) {
      const inBonus = !hard && st.count < QUIZ_CONFIG.bonusCount;
      const pts = hard ? QUIZ_CONFIG.hardPts : inBonus ? QUIZ_CONFIG.fullPts : QUIZ_CONFIG.latePts;
      st.earned += pts;
      st.count += 1;
      const opt = caseData.options[optionIndex];
      if (opt.dim && opt.d) user.dims[opt.dim] = Math.min(100, (user.dims[opt.dim] || 0) + opt.d);
      gained = pts;
    } else {
      lost = hard ? QUIZ_CONFIG.hardWrongPts : QUIZ_CONFIG.wrongPts;
      st.wrong += 1;
    }
  }

  user.points = Math.max(0, user.points + gained - lost);
  user.quizState = st;
  unlockBadges(user);
  user.weekly[user.weekly.length - 1] = overallScore(user.dims);

  const paidOver = st.phase !== "free" && (st.paidCount >= QUIZ_CONFIG.quizMax || st.wrong >= QUIZ_CONFIG.wrongMax);
  const overLimit = paidOver || st.phase === "free";
  return { user, correct, gained, lost, free, paidOver, overLimit, wrong: st.wrong };
}

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

/**
 * Hadiah satu baris kontribusi misi keluarga.
 *
 * Sengaja tidak mengikuti nilai kontribusi, karena nilai itu unit yang dipilih
 * anggota sendiri: kalau poin ikut nilai, owner bisa membuat target besar lalu
 * mengisinya sendiri. Jumlah baris per hari sudah dibatasi di family.js dan di
 * policy insert contributions, jadi total poin misi keluarga per hari tertutup.
 */
export function applyContribution(user, opts = {}) {
  return applyReward(user, CONTRIB_PTS, "goal", 1, opts);
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