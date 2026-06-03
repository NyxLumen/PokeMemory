// Web Audio API Retro Sound System for PokéMemory

let ctx = null;
let sfxVolume = 0.5;
let bgmVolume = 0.2;
let bgmActive = false;
let bgmTimeout = null;
let currentStep = 0;
let mainVolumeNode = null;
let bgmGainNode = null;

const NOTES = {
  // Frequencies for our 8-bit retro theme
  C2: 65.41, G2: 98.00, A2: 110.00, F2: 87.31,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
};

// Cute retro chord progressions (8 bars, eighth-note steps)
const bassPattern = [
  'C3', null, 'G3', 'C3', 'E3', null, 'G3', 'E3', // Bar 1
  'A3', null, 'E3', 'A3', 'C4', null, 'E3', 'C3', // Bar 2
  'F3', null, 'C3', 'F3', 'A3', null, 'C3', 'A3', // Bar 3
  'G3', null, 'D3', 'G3', 'B3', null, 'D3', 'B3', // Bar 4
  'C3', null, 'G3', 'C3', 'E3', null, 'G3', 'E3', // Bar 5
  'A3', null, 'E3', 'A3', 'C4', null, 'E3', 'C3', // Bar 6
  'F3', null, 'A3', 'F3', 'G3', null, 'B3', 'G3', // Bar 7
  'C4', 'G3', 'E3', 'C3', 'G3', 'B3', 'D4', 'G3'  // Bar 8
];

const melodyPattern = [
  'E5', null, 'G5', 'C6', null, 'E6', 'D6', 'C6',
  'C6', null, 'E5', 'A5', null, 'C6', 'B5', 'A5',
  'A5', null, 'C6', 'F6', null, 'E6', 'D6', 'C6',
  'B5', 'G5', 'A5', 'B5', 'C6', 'D6', 'E6', 'G6',
  'E6', null, 'G5', 'C6', null, 'E6', 'D6', 'C6',
  'C6', null, 'E5', 'A5', null, 'C6', 'B5', 'A5',
  'F5', 'A5', 'C6', 'F6', 'G5', 'B5', 'D6', 'G6',
  'C6', null, null, null, null, null, null, null
];

const BPM = 135;
const stepTime = 60 / BPM / 2; // duration of an eighth note in seconds (~0.22s)

function initAudio() {
  if (ctx) return;
  
  // Standard browser AudioContext
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  
  ctx = new AudioContextClass();
  
  // Create nodes
  mainVolumeNode = ctx.createGain();
  mainVolumeNode.gain.setValueAtTime(sfxVolume, ctx.currentTime);
  mainVolumeNode.connect(ctx.destination);

  bgmGainNode = ctx.createGain();
  bgmGainNode.gain.setValueAtTime(bgmVolume, ctx.currentTime);
  bgmGainNode.connect(ctx.destination);
}

// Make a noise buffer for drums
function playNoiseDrum(time, duration, volume, isSnare) {
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  // Hi-hat gets a high bandpass filter, snare gets a mid-range bandpass filter
  filter.frequency.setValueAtTime(isSnare ? 1000 : 8000, time);
  filter.Q.setValueAtTime(isSnare ? 2 : 5, time);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(bgmGainNode);
  noiseNode.start(time);
  noiseNode.stop(time + duration);
}

function playNextStep() {
  if (!bgmActive || !ctx) return;
  
  // Auto-resume if context was suspended by browser security
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const time = ctx.currentTime;
  
  // 1. Bass Synth (Triangle wave - soft & deep)
  const bassNote = bassPattern[currentStep % bassPattern.length];
  if (bassNote && NOTES[bassNote]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(NOTES[bassNote], time);
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + stepTime - 0.01);
    
    osc.connect(gain);
    gain.connect(bgmGainNode);
    osc.start(time);
    osc.stop(time + stepTime);
  }
  
  // 2. Melody Synth (Square wave - classic chiptune lead)
  const melodyNote = melodyPattern[currentStep % melodyPattern.length];
  if (melodyNote && NOTES[melodyNote]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(NOTES[melodyNote], time);
    
    gain.gain.setValueAtTime(0.08, time);
    // exponential decay to avoid clicky sounds
    gain.gain.exponentialRampToValueAtTime(0.005, time + stepTime - 0.01);
    
    osc.connect(gain);
    gain.connect(bgmGainNode);
    osc.start(time);
    osc.stop(time + stepTime);
  }

  // 3. Noise Drums (Simulate hi-hat and retro snare/bass hits)
  const beat = currentStep % 8;
  if (beat === 0) {
    // Bass drum click (thick triangle sweep)
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.type = 'triangle';
    kickOsc.frequency.setValueAtTime(100, time);
    kickOsc.frequency.exponentialRampToValueAtTime(0.01, time + 0.15);
    kickGain.gain.setValueAtTime(0.5, time);
    kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    kickOsc.connect(kickGain);
    kickGain.connect(bgmGainNode);
    kickOsc.start(time);
    kickOsc.stop(time + 0.15);
  } else if (beat === 4) {
    // Retro Snare
    playNoiseDrum(time, 0.12, 0.07, true);
  } else if (beat === 2 || beat === 6) {
    // Hi-hat
    playNoiseDrum(time, 0.04, 0.03, false);
  }

  currentStep = (currentStep + 1) % bassPattern.length;
  bgmTimeout = setTimeout(playNextStep, stepTime * 1000);
}

export const audioHelper = {
  // SFX Functions
  playFlip() {
    initAudio();
    if (!ctx || ctx.state === 'suspended' || sfxVolume === 0) return;
    
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    // Sliding frequency up
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(880, time + 0.08);
    
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    
    osc.connect(gain);
    gain.connect(mainVolumeNode);
    osc.start(time);
    osc.stop(time + 0.08);
  },

  playMatch() {
    initAudio();
    if (!ctx || ctx.state === 'suspended' || sfxVolume === 0) return;
    
    const time = ctx.currentTime;
    // Play a cheerful retro major triad arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const duration = 0.06;
    
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time + idx * duration);
      
      gain.gain.setValueAtTime(0.15, time + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (idx + 1) * duration);
      
      osc.connect(gain);
      gain.connect(mainVolumeNode);
      osc.start(time + idx * duration);
      osc.stop(time + (idx + 1) * duration + 0.05);
    });
  },

  playMismatch() {
    initAudio();
    if (!ctx || ctx.state === 'suspended' || sfxVolume === 0) return;
    
    const time = ctx.currentTime;
    const notes = [
      { f: 160, d: 0.15 },
      { f: 130, d: 0.15 },
      { f: 100, d: 0.15 },
      { f: 75, d: 0.45, slideTo: 35 }
    ];
    
    let offset = 0;
    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, time + offset);
      if (note.slideTo) {
        osc.frequency.linearRampToValueAtTime(note.slideTo, time + offset + note.d);
      }
      
      gain.gain.setValueAtTime(0.08, time + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + offset + note.d);
      
      osc.connect(gain);
      gain.connect(mainVolumeNode);
      osc.start(time + offset);
      osc.stop(time + offset + note.d + 0.05);
      
      offset += note.d - 0.02; // slight overlap
    });
  },

  playClick() {
    initAudio();
    if (!ctx || ctx.state === 'suspended' || sfxVolume === 0) return;
    
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);
    
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    osc.connect(gain);
    gain.connect(mainVolumeNode);
    osc.start(time);
    osc.stop(time + 0.05);
  },

  playVictory() {
    initAudio();
    if (!ctx || ctx.state === 'suspended' || sfxVolume === 0) return;
    
    const time = ctx.currentTime;
    // Triumphant 8-bit scale climb + major chord resolve theme
    const melody = [
      // Fast scale climb
      { f: 523.25, d: 0.08 }, // C5
      { f: 587.33, d: 0.08 }, // D5
      { f: 659.25, d: 0.08 }, // E5
      { f: 698.46, d: 0.08 }, // F5
      { f: 783.99, d: 0.08 }, // G5
      { f: 880.00, d: 0.08 }, // A5
      { f: 987.77, d: 0.08 }, // B5
      { f: 1046.50, d: 0.16 }, // C6
      
      // Happy riff
      { f: 987.77, d: 0.08 }, // B5
      { f: 1046.50, d: 0.08 }, // C6
      { f: 1174.66, d: 0.16 }, // D6
      { f: 1046.50, d: 0.08 }, // C6
      { f: 1174.66, d: 0.08 }, // D6
      { f: 1318.51, d: 0.3 }, // E6 (hold)
      
      // Rhythmic finish
      { f: 1174.66, d: 0.12 }, // D6
      { f: 1046.50, d: 0.12 }, // C6
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.4 }  // C6
    ];
    
    let currentOffset = 0;
    melody.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, time + currentOffset);
      
      gain.gain.setValueAtTime(0.08, time + currentOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, time + currentOffset + note.d);
      
      osc.connect(gain);
      gain.connect(mainVolumeNode);
      osc.start(time + currentOffset);
      osc.stop(time + currentOffset + note.d);
      
      currentOffset += note.d + 0.02;
    });
  },

  // BGM Functions
  startBGM() {
    initAudio();
    if (bgmActive) return;
    
    bgmActive = true;
    currentStep = 0;
    
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    
    playNextStep();
  },

  stopBGM() {
    bgmActive = false;
    if (bgmTimeout) {
      clearTimeout(bgmTimeout);
      bgmTimeout = null;
    }
  },

  setVolume(sfxVal, bgmVal) {
    sfxVolume = sfxVal;
    bgmVolume = bgmVal;
    
    if (mainVolumeNode && ctx) {
      mainVolumeNode.gain.setValueAtTime(sfxVolume, ctx.currentTime);
    }
    if (bgmGainNode && ctx) {
      bgmGainNode.gain.setValueAtTime(bgmVolume, ctx.currentTime);
    }
  },

  getSettings() {
    return { sfxVolume, bgmVolume, bgmActive };
  }
};
