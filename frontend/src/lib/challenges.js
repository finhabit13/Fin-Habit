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
