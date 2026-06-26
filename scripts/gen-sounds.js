/**
 * Generates three simple WAV sound files for Outblurt.
 * Run once: node scripts/gen-sounds.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(filename, durationMs, generateSample) {
  const numSamples = Math.floor(SAMPLE_RATE * durationMs / 1000);
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44 + dataSize);
  let o = 0;

  buf.write('RIFF', o); o += 4;
  buf.writeUInt32LE(36 + dataSize, o); o += 4;
  buf.write('WAVE', o); o += 4;
  buf.write('fmt ', o); o += 4;
  buf.writeUInt32LE(16, o); o += 4;
  buf.writeUInt16LE(1, o); o += 2;  // PCM
  buf.writeUInt16LE(1, o); o += 2;  // mono
  buf.writeUInt32LE(SAMPLE_RATE, o); o += 4;
  buf.writeUInt32LE(SAMPLE_RATE * 2, o); o += 4;
  buf.writeUInt16LE(2, o); o += 2;
  buf.writeUInt16LE(16, o); o += 2;
  buf.write('data', o); o += 4;
  buf.writeUInt32LE(dataSize, o); o += 4;

  const dur = durationMs / 1000;
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const s = Math.max(-1, Math.min(1, generateSample(t, dur)));
    buf.writeInt16LE(Math.round(s * 32767), o);
    o += 2;
  }

  const filepath = path.join(OUT_DIR, filename);
  fs.writeFileSync(filepath, buf);
  console.log(`✓ ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// Slow tick: 800 Hz sine, 80 ms, hard attack + quick decay
writeWav('tick.wav', 80, (t, dur) => {
  const attack = Math.min(t / 0.004, 1);
  const decay = Math.max(0, 1 - (t - 0.008) / (dur - 0.008));
  return 0.72 * Math.sin(2 * Math.PI * 800 * t) * attack * decay;
});

// Panic tick: 1300 Hz sine, 40 ms, razor attack
writeWav('fast-tick.wav', 40, (t, dur) => {
  const attack = Math.min(t / 0.002, 1);
  const decay = Math.max(0, 1 - t / dur);
  return 0.78 * Math.sin(2 * Math.PI * 1300 * t) * attack * decay;
});

// Explosion: descending tone + noise, 550 ms
let rng = 1234567;
function rand() { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return rng / 0x7fffffff; }

writeWav('explosion.wav', 550, (t, dur) => {
  const freq = 220 * Math.pow(55 / 220, t / dur);
  const tone = Math.sin(2 * Math.PI * freq * t);
  const noise = rand() * 2 - 1;
  const env = Math.pow(Math.max(0, 1 - t / dur), 1.4);
  return (0.45 * tone + 0.55 * noise) * env * 0.85;
});

console.log('Done — assets/sounds/ ready.');
