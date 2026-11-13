// FRESHTAG · sound + vibration. Sounds are synthesized with Web Audio (no audio files to load or cache).
// Inside the Expo Go shell, vibration goes to expo-haptics (iPhone has no navigator.vibrate).
// prefs: { sound, vibe } read through the getter so the caller's state object stays the single source of truth.

let ctx = null, getPrefs = () => ({ sound: true, vibe: true });
export const initFeedback = fn => { getPrefs = fn; };

// Browsers only allow audio after a user gesture: unlock on the first tap.
const unlock = () => {
  try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch { ctx = null; }
};
['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, unlock, { capture: true, passive: true }));

// One soft bell-like note: sine + a quiet octave partial, fast attack, exponential decay.
function note(freq, at, dur = 0.35, gain = 0.16, type = 'sine') {
  const t = ctx.currentTime + at;
  [[freq, gain, type], [freq * 2, gain * 0.18, 'sine']].forEach(([f, g, ty]) => {
    const o = ctx.createOscillator(), v = ctx.createGain();
    o.type = ty; o.frequency.setValueAtTime(f, t);
    v.gain.setValueAtTime(0.0001, t);
    v.gain.exponentialRampToValueAtTime(g, t + 0.012);
    v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(v).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  });
}

// Notes in Hz. Major, short and soft: the brand is friendly, never alarming.
const SOUNDS = {
  tap:     () => note(1320, 0, 0.05, 0.035, 'triangle'),
  success: () => { note(784, 0, 0.28); note(1175, 0.09, 0.42); },           // G5 → D6
  warning: () => { note(659, 0, 0.26, 0.14); note(523, 0.12, 0.38, 0.14); }, // E5 → C5
  nfc:     () => { note(1568, 0, 0.18, 0.12); note(2093, 0.07, 0.3, 0.1); },  // quick bright ping
  notif:   () => { note(659, 0, 0.5); note(784, 0.14, 0.5); note(1047, 0.28, 0.8); }, // E5 G5 C6 chime
  timer:   () => [0, 0.32, 0.64].forEach(d => { note(1047, d, 0.22); note(1319, d + 0.1, 0.3); }),
};

// Vibration patterns in ms (Android); kind names match the Expo shell's HAPTICS map.
const VIBES = { tap: 8, success: [12, 50, 22], warning: [24, 40, 24], nfc: [30], notif: [200, 100, 200], timer: [300, 150, 300, 150, 300] };

export function feedback(kind = 'tap') {
  const p = getPrefs();
  if (p.vibe !== false) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', kind }));
    else navigator.vibrate?.(VIBES[kind] ?? VIBES.tap);
  }
  if (p.sound !== false && kind !== 'tap') {
    unlock();
    if (ctx && ctx.state === 'running') { try { (SOUNDS[kind] || SOUNDS.tap)(); } catch { /* audio is a nice-to-have */ } }
  }
}

export const NOTIF_VIBRATE = VIBES.notif;
