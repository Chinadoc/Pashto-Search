/**
 * Minimal Firestore seed script to add a `verses` document
 * with a `tokens` array for word-level search.
 *
 * Usage:
 *  1) Create a service account in Firebase console (Editor role is enough for seeding).
 *  2) Download JSON and point to it via GOOGLE_APPLICATION_CREDENTIALS
 *     or paste JSON into FIREBASE_SERVICE_ACCOUNT env var.
 *  3) Run: node scripts/seed_firestore.js
 */

const fs = require('fs');
const admin = require('firebase-admin');

function loadServiceAccount() {
  // Option 1: direct JSON via env var
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON');
    }
  }

  // Option 2: GOOGLE_APPLICATION_CREDENTIALS path
  const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (p && fs.existsSync(p)) {
    return require(p);
  }

  throw new Error('Missing service account. Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS');
}

function normalizeTokens(text) {
  return `${text}`
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

async function main() {
  const sa = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(sa),
    });
  }
  const db = admin.firestore();

  const sample = {
    book: 'John',
    chapter: 3,
    verse: 16,
    text: 'ځکه خدای نړۍ دومره مینه کړه چې خپل یوازینی زوی یې ورکړ، څو هر څوک چې په هغه ایمان راوړي، هلاک نه شي بلکې ابدي ژوند ولري.',
    testament: 'NT',
  };
  const tokens = normalizeTokens(sample.text);

  const docId = `${sample.book}_${sample.chapter}_${sample.verse}`;
  await db.collection('verses').doc(docId).set({ ...sample, tokens }, { merge: true });
  console.log('Seeded verse', docId, 'with', tokens.length, 'tokens');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

