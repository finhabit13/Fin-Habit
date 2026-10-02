import { CHALLENGES } from "./data.js";

/**
 * Challenge dari database (dibuat admin) disimpan di memori dan digabung dengan
 * challenge bawaan. Ini satu-satunya tempat mencari poin/dimensi sebuah challenge,
 * jadi api.js dan store.js tidak perlu tahu challenge datang dari mana.
 */
let remote = [];

export const setRemoteChallenges = (list) => {
  remote = Array.isArray(list) ? list : [];
};

export const allChallenges = () => (remote.length ? [...remote, ...CHALLENGES] : CHALLENGES);

export const challengeById = (id) => allChallenges().find((c) => c.id === id) || {};

/**
 * Challenge yang boleh ditawarkan ke user.
 *
 * Sengaja dipisah dari allChallenges(). Challenge yang dimatikan admin harus
 * hilang dari pilihan harian, tapi tidak boleh hilang dari pencarian by id:
 * orang yang sudah menyelesaikannya sebelum challenge itu dimatikan tetap harus
 * bisa menyelesaikan dan tetap dapat poinnya. Kalau filter-nya dipasang di
 * allChallenges(), challengeById akan mengembalikan objek kosong tepat ketika
 * seseorang sedang menyelesaikan challenge itu.
 *
 * Challenge bawaan tidak punya field active, jadi `!== false` membuat semuanya
 * tetap terbawa seperti sebelumnya.
 */
export const offerableChallenges = () => allChallenges().filter((c) => c.active !== false);
