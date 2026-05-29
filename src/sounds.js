// Lightweight Web Audio API Synthesizer for UI Sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, vol) {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

export function playLikeSound() {
  // A satisfying two-tone pop for liking
  playTone(600, 'sine', 0.1, 0.2);
  setTimeout(() => playTone(800, 'sine', 0.15, 0.2), 50);
}

export function playPostSound() {
  // A whoosh/level-up sound for posting
  playTone(300, 'triangle', 0.1, 0.1);
  setTimeout(() => playTone(500, 'triangle', 0.1, 0.1), 100);
  setTimeout(() => playTone(700, 'triangle', 0.2, 0.1), 200);
}

export function playRepostSound() {
  // A metallic clink for reposting
  playTone(800, 'square', 0.05, 0.1);
  setTimeout(() => playTone(1200, 'square', 0.1, 0.1), 50);
}

export function playCashOutSound() {
  // Synthesized coin burst: a series of bright, happy coin tones
  const playCoin = (delay, freq1, freq2) => {
    setTimeout(() => {
      playTone(freq1, 'sine', 0.08, 0.15);
      setTimeout(() => playTone(freq2, 'sine', 0.15, 0.15), 60);
    }, delay);
  };

  playCoin(0, 987.77, 1318.51); // B5 -> E6
  playCoin(120, 1046.50, 1396.91); // C6 -> F6
  playCoin(240, 1174.66, 1567.98); // D6 -> G6
  playCoin(360, 1318.51, 1760.00); // E6 -> A6
  playCoin(480, 1567.98, 2093.00); // G6 -> C7
}
