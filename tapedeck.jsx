// v3-tapedeck.jsx
// Tape deck UI + procedural lo-fi audio engine (Tone.js)
//
// Exposes <TapeDeck/> globally for v3-mount.jsx.
//
// AUDIO: Each track is a procedural pattern (drums + Rhodes chords + bass +
// vinyl crackle) scheduled on Tone.Transport. No samples — everything synthesised
// so the page stays a single static HTML + a tiny .jsx.

// ── TRACK DEFINITIONS ────────────────────────────────────────────────────────
// chords: Array<Array<string>> — one bar per chord, note arrays
// bass:   Array<string> — one note per bar
// drumPat: Array<{k?:1,s?:1,h?:1}|null> — 16th-note grid per bar
const TRACKS = [
  {
    id: 'daylight',
    name: 'Daylight Loop',
    release: 'Inspired by Insights · 2022',
    label: 'PROCEDURAL AUDIO',
    bpm: 75,
    durSec: 196,
    chords: [
      ['C4','E4','G4','B4'],   // Cmaj7
      ['A3','C4','E4','G4'],   // Am7
      ['F3','A3','C4','E4'],   // Fmaj7
      ['G3','B3','D4','F4'],   // G7
    ],
    bass: ['C2','A1','F1','G1'],
    drumPat: [
      // 16 steps per bar
      {k:1,h:1}, null, {h:1}, null, {s:1,h:1}, null, {h:1}, {k:1},
      {k:1,h:1}, null, {h:1}, null, {s:1,h:1}, null, {h:1}, null,
    ],
  },
  {
    id: 'blue',
    name: 'Blue Fraction Loop',
    release: 'Inspired by Insights · 2022',
    label: 'PROCEDURAL AUDIO',
    bpm: 68,
    durSec: 184,
    chords: [
      ['D3','F3','A3','C4','E4'],  // Dm9
      ['G3','Bb3','D4','F4','A4'], // Gm9
      ['A3','C#4','E4','G4'],      // A7
      ['D3','F3','A3','C4'],       // Dm7
    ],
    bass: ['D2','G1','A1','D2'],
    drumPat: [
      {k:1,h:1}, null, null, {h:1}, {s:1}, null, {h:1}, null,
      null, {k:1,h:1}, null, null, {s:1,h:1}, null, null, {h:1},
    ],
  },
  {
    id: 'zeal',
    name: 'Zeal Loop',
    release: 'Inspired by Insights · 2022',
    label: 'PROCEDURAL AUDIO',
    bpm: 88,
    durSec: 172,
    chords: [
      ['F3','A3','C4','E4'],   // Fmaj7
      ['Bb3','D4','F4','A4'],  // Bbmaj7
      ['C4','E4','G4','B4'],   // Cmaj7
      ['A3','C4','E4','G4'],   // Am7
    ],
    bass: ['F1','Bb1','C2','A1'],
    drumPat: [
      {k:1,h:1}, {h:1}, {h:1}, {k:1}, {s:1,h:1}, {h:1}, {h:1}, {h:1},
      {k:1,h:1}, {h:1}, {k:1}, {h:1}, {s:1,h:1}, {h:1}, {h:1}, {k:1,h:1},
    ],
  },
  {
    id: 'serendipity',
    name: 'Serendipity Loop',
    release: 'Inspired by release w/ LESKY · 2018',
    label: 'PROCEDURAL AUDIO',
    bpm: 72,
    durSec: 218,
    chords: [
      ['Bb3','D4','F4','A4'],  // Bbmaj7
      ['Eb3','G3','Bb3','D4'], // Ebmaj7
      ['F3','A3','C4','Eb4'],  // F7
      ['Bb3','D4','F4'],       // Bb
    ],
    bass: ['Bb1','Eb2','F1','Bb1'],
    drumPat: [
      {k:1,h:1}, null, {h:1}, null, {s:1,h:1}, null, {h:1}, null,
      null, {k:1,h:1}, null, {h:1}, {s:1}, null, {h:1}, {k:1},
    ],
  },
];

// ── AUDIO ENGINE ─────────────────────────────────────────────────────────────
// Owns all Tone nodes; created lazily on first play so we don't fight the
// browser autoplay policy. mutates `state` for things the UI polls each frame
// (currentTime, meter levels). Track changes restart the transport with a new
// schedule of Tone.Events.
function createEngine() {
  const ctx = {
    inited: false,
    playing: false,
    currentTrackIdx: 0,
    startedAt: 0,        // Tone.now() when current play began
    elapsedAt: 0,        // seconds already played when last paused
    cleanup: null,       // teardown for current track's scheduled events
    levels: { L: 0, R: 0, peakL: 0, peakR: 0 },
    nodes: null,
    volume: 0.7,         // 0..1
    lofi: 0.5,           // 0..1, mapped to filter cutoff
  };

  function init() {
    if (ctx.inited) return;
    ctx.inited = true;

    // Master chain: synths → lofi filter → reverb → meter → out
    const meter = new Tone.Meter({ channels: 2, smoothing: 0.85 });
    const lofiFilter = new Tone.Filter({ frequency: 2200, type: 'lowpass', rolloff: -24 });
    const reverb = new Tone.Reverb({ decay: 3.6, wet: 0.22 });
    const tapeWobble = new Tone.Vibrato({ frequency: 1.4, depth: 0.04 });
    const compressor = new Tone.Compressor({ threshold: -22, ratio: 3.5 });
    const master = new Tone.Gain(0.7);
    lofiFilter.chain(tapeWobble, reverb, compressor, master, meter, Tone.Destination);

    // Vinyl crackle
    const crackle = new Tone.Noise('pink');
    const crackleHP = new Tone.Filter(1200, 'highpass');
    const crackleGate = new Tone.Gain(0.06);
    crackle.chain(crackleHP, crackleGate, lofiFilter);

    // Rhodes-ish chord
    const rhodes = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.2,
      modulationIndex: 9,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.35, sustain: 0.45, release: 1.6 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.01, decay: 0.4, sustain: 0.18, release: 0.8 },
    });
    rhodes.volume.value = -10;
    rhodes.connect(lofiFilter);

    // Kick
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 6,
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    });
    kick.volume.value = -2;
    kick.connect(lofiFilter);

    // Snare
    const snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
    });
    snare.volume.value = -16;
    const snareBody = new Tone.MembraneSynth({
      pitchDecay: 0.02, octaves: 3,
      envelope: { attack: 0.001, decay: 0.12, sustain: 0 },
    });
    snareBody.volume.value = -18;
    snare.connect(lofiFilter); snareBody.connect(lofiFilter);

    // Hi-hat
    const hihat = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.045, sustain: 0 },
    });
    hihat.volume.value = -28;
    const hihatHP = new Tone.Filter(8000, 'highpass');
    hihat.connect(hihatHP); hihatHP.connect(lofiFilter);

    // Bass
    const bass = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { frequency: 800, type: 'lowpass' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.55, release: 0.5 },
      filterEnvelope: { attack: 0.02, decay: 0.4, sustain: 0.4, release: 0.6, baseFrequency: 200, octaves: 2 },
    });
    bass.volume.value = -6;
    bass.connect(lofiFilter);

    ctx.nodes = { lofiFilter, reverb, master, meter, crackle, rhodes, kick, snare, snareBody, hihat, bass, tapeWobble };
    applyLofi();
    applyVolume();
  }

  function applyLofi() {
    if (!ctx.nodes) return;
    // 0 = warm/dark (800Hz), 1 = open (12kHz). Lo-fi gets MORE filtered as the
    // knob goes DOWN — invert: lower lofi value = warmer/darker.
    const freq = 800 + (1 - ctx.lofi) * 0; // placeholder
    const cutoff = 600 + ctx.lofi * 11000;
    ctx.nodes.lofiFilter.frequency.rampTo(cutoff, 0.2);
    ctx.nodes.crackle.volume.rampTo(-30 + (1 - ctx.lofi) * 18, 0.2);
    ctx.nodes.tapeWobble.depth.rampTo(0.02 + (1 - ctx.lofi) * 0.08, 0.2);
  }

  function applyVolume() {
    if (!ctx.nodes) return;
    ctx.nodes.master.gain.rampTo(ctx.volume, 0.1);
  }

  function scheduleTrack(trackIdx) {
    const t = TRACKS[trackIdx];
    Tone.Transport.cancel(0);
    Tone.Transport.bpm.value = t.bpm;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    // 4 bars (one chord per bar)
    Tone.Transport.loopEnd = '4m';

    const evs = [];

    // Schedule chord per bar
    t.chords.forEach((chord, bar) => {
      evs.push(Tone.Transport.schedule((time) => {
        ctx.nodes.rhodes.triggerAttackRelease(chord, '1m', time);
      }, `${bar}m`));
    });

    // Schedule bass per bar — root on beat 1, off-beat ghost on the "+ of 3"
    t.bass.forEach((note, bar) => {
      evs.push(Tone.Transport.schedule((time) => {
        ctx.nodes.bass.triggerAttackRelease(note, '4n.', time);
      }, `${bar}m`));
      evs.push(Tone.Transport.schedule((time) => {
        ctx.nodes.bass.triggerAttackRelease(note, '8n', time);
      }, `${bar}m + 2:2:0`)); // "+ of 3" in beats
    });

    // Schedule drum pattern across all 4 bars (16 steps per bar)
    for (let bar = 0; bar < 4; bar++) {
      for (let step = 0; step < 16; step++) {
        const hit = t.drumPat[step];
        if (!hit) continue;
        const tpos = `${bar}:${Math.floor(step / 4)}:${step % 4}`;
        if (hit.k) evs.push(Tone.Transport.schedule((time) => {
          ctx.nodes.kick.triggerAttackRelease('C1', '8n', time, 0.9);
        }, tpos));
        if (hit.s) evs.push(Tone.Transport.schedule((time) => {
          ctx.nodes.snare.triggerAttackRelease('16n', time, 0.6);
          ctx.nodes.snareBody.triggerAttackRelease('D2', '16n', time, 0.5);
        }, tpos));
        if (hit.h) evs.push(Tone.Transport.schedule((time) => {
          ctx.nodes.hihat.triggerAttackRelease('32n', time, 0.7);
        }, tpos));
      }
    }

    ctx.cleanup = () => {
      evs.forEach((id) => Tone.Transport.clear(id));
    };
  }

  async function play() {
    if (typeof Tone === 'undefined') {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/tone@14.8.49/build/Tone.js';
        s.onload = resolve;
        s.onerror = () => reject(new Error('Tone.js failed to load'));
        document.head.appendChild(s);
      });
    }
    init();
    if (Tone.context.state !== 'running') await Tone.start();
    if (!ctx.cleanup) scheduleTrack(ctx.currentTrackIdx);
    ctx.nodes.crackle.start();
    Tone.Transport.start();
    ctx.startedAt = Tone.now();
    ctx.playing = true;
  }

  function pause() {
    if (!ctx.inited) return;
    Tone.Transport.pause();
    try { ctx.nodes.crackle.stop(); } catch (e) {}
    ctx.elapsedAt += Tone.now() - ctx.startedAt;
    ctx.playing = false;
  }

  function selectTrack(idx) {
    const wasPlaying = ctx.playing;
    if (ctx.inited) {
      Tone.Transport.stop();
      try { ctx.nodes.crackle.stop(); } catch (e) {}
      if (ctx.cleanup) { ctx.cleanup(); ctx.cleanup = null; }
    }
    ctx.currentTrackIdx = idx;
    ctx.elapsedAt = 0;
    ctx.startedAt = 0;
    if (wasPlaying) play();
  }

  function next() { selectTrack((ctx.currentTrackIdx + 1) % TRACKS.length); }
  function prev() { selectTrack((ctx.currentTrackIdx - 1 + TRACKS.length) % TRACKS.length); }

  function setLofi(v) { ctx.lofi = v; applyLofi(); }
  function setVolume(v) { ctx.volume = v; applyVolume(); }

  function getLevels() {
    if (!ctx.nodes) return ctx.levels;
    const vals = ctx.nodes.meter.getValue();
    // Tone returns dB; map -60..0 to 0..1
    const norm = (db) => Math.max(0, Math.min(1, (db + 60) / 60));
    const L = Array.isArray(vals) ? norm(vals[0]) : norm(vals);
    const R = Array.isArray(vals) ? norm(vals[1]) : norm(vals);
    ctx.levels.L = L; ctx.levels.R = R;
    ctx.levels.peakL = Math.max(L, ctx.levels.peakL * 0.94);
    ctx.levels.peakR = Math.max(R, ctx.levels.peakR * 0.94);
    return ctx.levels;
  }

  return { ctx, play, pause, next, prev, selectTrack, setLofi, setVolume, getLevels };
}

// ── REEL SVG ─────────────────────────────────────────────────────────────────
function Reel({ spinning, side }) {
  return (
    <div className={`tdk-reel ${spinning ? 'spin' : ''} ${side}`}>
      <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="#0a0a0a" />
        <circle cx="50" cy="50" r="44" fill="none" stroke="#3a2a18" strokeWidth="1.5" strokeDasharray="2 4" opacity=".6" />
        {/* Spokes */}
        <g stroke="#bdb29a" strokeWidth="2" fill="none">
          <line x1="50" y1="14" x2="50" y2="32" />
          <line x1="50" y1="86" x2="50" y2="68" />
          <line x1="14" y1="50" x2="32" y2="50" />
          <line x1="86" y1="50" x2="68" y2="50" />
          <line x1="22" y1="22" x2="34" y2="34" />
          <line x1="78" y1="78" x2="66" y2="66" />
          <line x1="78" y1="22" x2="66" y2="34" />
          <line x1="22" y1="78" x2="34" y2="66" />
        </g>
        {/* Hub */}
        <circle cx="50" cy="50" r="14" fill="#1a1410" stroke="#f5ead0" strokeWidth="1" />
        <circle cx="50" cy="50" r="5" fill="#f5ead0" />
        {/* Spoke teeth around hub */}
        <g fill="#f5ead0">
          <rect x="48.5" y="36" width="3" height="6" />
          <rect x="48.5" y="58" width="3" height="6" />
          <rect x="36" y="48.5" width="6" height="3" />
          <rect x="58" y="48.5" width="6" height="3" />
        </g>
      </svg>
    </div>
  );
}

// ── VU METER ─────────────────────────────────────────────────────────────────
function VuMeter({ engine, playing }) {
  const lRef = React.useRef(null);
  const rRef = React.useRef(null);
  const lPkRef = React.useRef(null);
  const rPkRef = React.useRef(null);
  React.useEffect(() => {
    let raf;
    const tick = () => {
      const lv = engine.getLevels();
      const L = playing ? lv.L : 0;
      const R = playing ? lv.R : 0;
      if (lRef.current) lRef.current.style.transform = `scaleX(${L})`;
      if (rRef.current) rRef.current.style.transform = `scaleX(${R})`;
      if (lPkRef.current) lPkRef.current.style.left = `calc(${(playing ? lv.peakL : 0) * 100}% - 2px)`;
      if (rPkRef.current) rPkRef.current.style.left = `calc(${(playing ? lv.peakR : 0) * 100}% - 2px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [engine, playing]);
  return (
    <div className="tdk-vu">
      <div className="tdk-vu-row">
        <span className="tdk-vu-lbl">L</span>
        <div className="tdk-vu-track">
          <div className="tdk-vu-fill" ref={lRef} />
          <div className="tdk-vu-peak" ref={lPkRef} />
          <div className="tdk-vu-ticks"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
        </div>
        <span className="tdk-vu-num">−0dB</span>
      </div>
      <div className="tdk-vu-row">
        <span className="tdk-vu-lbl">R</span>
        <div className="tdk-vu-track">
          <div className="tdk-vu-fill" ref={rRef} />
          <div className="tdk-vu-peak" ref={rPkRef} />
          <div className="tdk-vu-ticks"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
        </div>
        <span className="tdk-vu-num">−0dB</span>
      </div>
    </div>
  );
}

// ── KNOB ─────────────────────────────────────────────────────────────────────
function Knob({ label, value, onChange, color = 'var(--amber)' }) {
  // value 0..1 → -135deg..135deg
  const angle = -135 + value * 270;
  const startRef = React.useRef({ y: 0, val: 0 });
  const onDown = (e) => {
    startRef.current = { y: e.clientY, val: value };
    const move = (ev) => {
      const dy = startRef.current.y - ev.clientY;
      const next = Math.max(0, Math.min(1, startRef.current.val + dy / 140));
      onChange(next);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const onKeyDown = (e) => {
    const increment = e.shiftKey ? 0.1 : 0.04;
    let next = value;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = value + increment;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = value - increment;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 1;
    else return;
    e.preventDefault();
    onChange(Math.max(0, Math.min(1, next)));
  };
  return (
    <div className="tdk-knob">
      <div
        className="tdk-knob-body"
        onPointerDown={onDown}
        onKeyDown={onKeyDown}
        title="Drag or use arrow keys to adjust"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(value * 100)}
      >
        <div className="tdk-knob-ind" style={{ transform: `rotate(${angle}deg)` }}>
          <i style={{ background: color }} />
        </div>
        <div className="tdk-knob-arc" style={{ background: `conic-gradient(from -135deg, ${color} 0deg, ${color} ${value * 270}deg, transparent ${value * 270}deg)` }} />
      </div>
      <div className="tdk-knob-lbl">{label}</div>
    </div>
  );
}

// ── TAPE DECK MAIN ───────────────────────────────────────────────────────────
function TapeDeck() {
  const engineRef = React.useRef(null);
  if (!engineRef.current) engineRef.current = createEngine();
  const engine = engineRef.current;

  const [playing, setPlaying] = React.useState(false);
  const [hasPlayed, setHasPlayed] = React.useState(false);
  const [trackIdx, setTrackIdx] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [volume, setVol] = React.useState(0.7);
  const [lofi, setLofi] = React.useState(0.5);

  const track = TRACKS[trackIdx];

  // tick elapsed time when playing
  React.useEffect(() => {
    if (!playing) return;
    let raf, start = performance.now() - elapsed * 1000;
    const tick = () => {
      setElapsed((performance.now() - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [playing, trackIdx]);

  const togglePlay = async () => {
    if (playing) { engine.pause(); setPlaying(false); }
    else { await engine.play(); setPlaying(true); setHasPlayed(true); }
  };
  const onPrev = () => { engine.prev(); setTrackIdx(engine.ctx.currentTrackIdx); setElapsed(0); };
  const onNext = () => { engine.next(); setTrackIdx(engine.ctx.currentTrackIdx); setElapsed(0); };
  const onSelect = (i) => { engine.selectTrack(i); setTrackIdx(i); setElapsed(0); };
  const onVolume = (v) => { setVol(v); engine.setVolume(v); };
  const onLofi = (v) => { setLofi(v); engine.setLofi(v); };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const progress = Math.min(1, (elapsed % track.durSec) / track.durSec);

  return (
    <>
      <style>{TAPE_CSS}</style>
      <div className="tdk-wrap" aria-label="Procedural tape loops player">

        <div className="tdk-strip">
          <div className="tdk-strip-l">
            <span className="tdk-brand">PHLO<i>·</i>MATIC</span>
            <span className="tdk-sep">|</span>
            <span>TAPE DECK · UNIT II</span>
          </div>
          <div className="tdk-strip-r">
            <span className={playing ? 'tdk-on' : ''}>● {playing ? 'PLAYING' : 'STANDBY'}</span>
          </div>
        </div>

        <div className="tdk-face">
          <div className="tdk-cassette">
            <div className="tdk-cassette-inner">
              <div className="tdk-c-label">
                <div className="tdk-c-label-band">
                  <span className="tdk-c-title">{track.name.replace(' Loop', '')}</span>
                  <span className="tdk-c-sub">{track.label}</span>
                </div>
              </div>
              <div className="tdk-c-tape-info">
                <span>{track.release}</span>
                <span>{track.bpm} BPM</span>
              </div>
              <div className="tdk-reels">
                <Reel spinning={playing} side="l" />
                <div className="tdk-ribbon">
                  <div className="tdk-ribbon-fill" style={{ width: `${progress * 100}%` }} />
                </div>
                <Reel spinning={playing} side="r" />
              </div>
              <div className="tdk-c-holes">
                <i /><i /><i /><i /><i />
              </div>
            </div>
          </div>

          <div className="tdk-control">
            <div className="tdk-lcd">
              <div className="tdk-lcd-row">
                <span className="tdk-lcd-mode">{playing ? '▶ PLAY' : '■ STOP'}</span>
                <span className="tdk-lcd-time tdk-lcd-dim">{fmtTime(elapsed % track.durSec)} / {fmtTime(track.durSec)}</span>
              </div>
              <div className="tdk-lcd-title">{track.name.replace(' Loop', '')}</div>
              <div className="tdk-lcd-meta">{track.release}</div>
              <div className="tdk-scrubber">
                <div className="tdk-scrubber-fill" style={{ width: `${progress * 100}%` }} />
                <div className="tdk-scrubber-head" style={{ left: `calc(${progress * 100}% - 2px)` }} />
              </div>
              {!hasPlayed && (
                <div className="tdk-play-hint" aria-live="polite">
                  <span>▶ Press play to start procedural audio</span>
                </div>
              )}
            </div>

            <div className="tdk-transport">
              <button className="tdk-btn tdk-btn-sm" onClick={onPrev} aria-label="Previous track">⏮</button>
              <button
                className={`tdk-btn tdk-btn-play${playing ? ' is-playing' : ''}`}
                onClick={togglePlay}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? '⏸' : '▶'}
              </button>
              <button className="tdk-btn tdk-btn-sm" onClick={onNext} aria-label="Next track">⏭</button>
              <div className="tdk-knobs">
                <Knob label="VOL" value={volume} onChange={onVolume} color="var(--amber)" />
                <Knob label="LO-FI" value={lofi} onChange={onLofi} color="var(--orange)" />
              </div>
            </div>

            <VuMeter engine={engine} playing={playing} />
          </div>
        </div>

        <div className="tdk-tracks">
          <div className="tdk-tracks-head">
            <span>#</span>
            <span>Title</span>
            <span className="h-rel">Release</span>
            <span className="h-bpm">BPM</span>
            <span>Time</span>
            <span></span>
          </div>
          {TRACKS.map((t, i) => (
            <button
              key={t.id}
              className={`tdk-tr${i === trackIdx ? ' is-active' : ''}`}
              onClick={() => onSelect(i)}
              aria-pressed={i === trackIdx}
            >
              <span className="tdk-tr-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="tdk-tr-name">{t.name.replace(' Loop', '')}</span>
              <span className="tdk-tr-rel">{t.release}</span>
              <span className="tdk-tr-bpm">{t.bpm}</span>
              <span className="tdk-tr-time">{fmtTime(t.durSec)}</span>
              <span className="tdk-tr-play">{i === trackIdx && playing ? '▶' : '○'}</span>
            </button>
          ))}
          <div className="tdk-tracks-hint">Tap a row to load · swipe left for BPM &amp; length</div>
        </div>

        <div className="tdk-foot">
          <span>PROCEDURAL AUDIO · NOT ORIGINAL RECORDINGS</span>
          <span>PHLO·MATIC UNIT II © 2026</span>
        </div>

      </div>
    </>
  );
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const TAPE_CSS = `
  .mini-deck{
    display:grid;
    grid-template-columns:minmax(210px, 1fr) minmax(260px, 1.45fr) auto;
    align-items:center;
    gap:24px;
    padding:22px 24px;
    border:1px solid var(--rule);
    border-radius:12px;
    background:linear-gradient(180deg, var(--coal-2), var(--coal));
    box-shadow:0 18px 42px rgba(0,0,0,.27), inset 0 1px 0 rgba(255,255,255,.04);
  }
  .mini-label{
    margin-bottom:9px;
    font-family:'DM Mono', monospace;
    font-size:10px;
    letter-spacing:.1em;
    color:var(--amber);
  }
  .mini-title{
    font-family:var(--display);
    font-size:clamp(24px, 2.8vw, 34px);
    line-height:1;
    text-transform:uppercase;
  }
  .mini-meta{
    margin-top:9px;
    font-family:'DM Mono', monospace;
    font-size:10px;
    line-height:1.5;
    letter-spacing:.06em;
    text-transform:uppercase;
    color:var(--cream-dim);
  }
  .mini-progress{
    height:5px;
    overflow:hidden;
    border-radius:999px;
    background:color-mix(in oklab, var(--cream) 12%, transparent);
  }
  .mini-progress-fill{
    height:100%;
    border-radius:inherit;
    background:var(--orange);
    transition:width .12s linear;
  }
  .mini-picks{display:flex;gap:7px;flex-wrap:wrap;margin-top:14px;}
  .mini-pick{
    appearance:none;
    padding:8px 11px;
    border:1px solid var(--rule);
    border-radius:999px;
    background:transparent;
    color:var(--cream-dim);
    font-family:'DM Mono', monospace;
    font-size:10px;
    letter-spacing:.04em;
    text-transform:uppercase;
    cursor:pointer;
    transition:color .15s ease,border-color .15s ease,background .15s ease;
  }
  .mini-pick:hover, .mini-pick.is-active{border-color:var(--orange);color:var(--cream);}
  .mini-pick.is-active{background:color-mix(in oklab, var(--orange) 18%, transparent);}
  .mini-controls{display:flex;align-items:center;gap:8px;}
  .mini-time{
    margin-right:8px;
    color:var(--cream-dim);
    font-family:'DM Mono', monospace;
    font-size:11px;
    font-variant-numeric:tabular-nums;
    white-space:nowrap;
  }
  .mini-btn{
    appearance:none;
    height:42px;
    padding:0 13px;
    border:1px solid var(--rule);
    border-radius:999px;
    background:transparent;
    color:var(--cream);
    font-family:'DM Mono', monospace;
    font-size:11px;
    letter-spacing:.06em;
    text-transform:uppercase;
    cursor:pointer;
    transition:border-color .15s ease,background .15s ease,color .15s ease;
  }
  .mini-btn:hover{border-color:var(--orange);}
  .mini-play{padding-inline:21px;background:var(--orange);border-color:var(--orange);color:var(--coal);}
  .mini-play:hover{background:var(--amber);border-color:var(--amber);}
  .mini-play.is-playing{background:transparent;color:var(--orange);}
  .mini-btn:focus-visible, .mini-pick:focus-visible{outline:2px solid var(--amber);outline-offset:3px;}

  .tdk-wrap{
    background: linear-gradient(180deg, var(--coal-2) 0%, var(--coal) 100%);
    border:1px solid var(--rule);border-radius:14px;
    overflow:hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04);
  }
  .tdk-strip{
    display:flex;justify-content:space-between;align-items:center;
    padding:12px 22px;
    background:var(--coal);
    border-bottom:1px solid var(--rule);
    font-family:'DM Mono', monospace;font-size:11px;letter-spacing:.08em;text-transform:uppercase;
    color:var(--cream-dim);
  }
  .tdk-strip-l, .tdk-strip-r{display:flex;align-items:center;gap:12px;}
  .tdk-brand{color:var(--cream);font-weight:500;}
  .tdk-brand i{color:var(--orange);font-style:normal;}
  .tdk-sep{opacity:.4;}
  .tdk-on{color:var(--orange);}

  .tdk-face{
    display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:0;
    padding:30px;align-items:stretch;
  }

  /* CASSETTE */
  .tdk-cassette{
    background: linear-gradient(180deg, #2a1f12, #1a130a);
    border-radius:14px;
    padding:20px;
    box-shadow: inset 0 2px 8px rgba(0,0,0,.6), 0 6px 0 rgba(0,0,0,.3);
    position:relative;
  }
  .tdk-cassette-inner{
    background: var(--cream);
    color:var(--coal);
    border-radius:6px;
    padding:14px 16px 20px;
    position:relative;
    box-shadow: 0 1px 0 rgba(255,255,255,.5) inset, 0 12px 30px rgba(0,0,0,.4);
    overflow:hidden;
  }
  .tdk-c-label{margin-bottom:14px;}
  .tdk-c-label-band{
    background:var(--orange);color:var(--coal);
    padding:10px 14px;border-radius:4px;
    border:1.5px solid var(--coal);
    display:flex;justify-content:space-between;align-items:baseline;gap:10px;
  }
  .tdk-c-title{font-family:var(--display);font-size:24px;text-transform:uppercase;letter-spacing:-.01em;line-height:1;}
  .tdk-c-sub{font-family:'DM Mono', monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;opacity:.8;}
  .tdk-c-tape-info{display:flex;justify-content:space-between;font-family:'DM Mono', monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--coal);opacity:.7;margin-top:8px;padding:0 4px;}

  .tdk-reels{
    display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:16px;
    margin-top:8px;
    padding:12px 6px;
  }
  .tdk-reel{aspect-ratio:1/1;width:100%;max-width:130px;justify-self:center;}
  .tdk-reel.l{justify-self:end;}
  .tdk-reel.r{justify-self:start;}
  .tdk-reel svg{display:block;width:100%;height:100%;}
  .tdk-reel.spin svg{animation:tdk-spin 2s linear infinite;}
  @keyframes tdk-spin{to{transform:rotate(360deg);}}

  .tdk-ribbon{
    height:8px;width:120px;background:#1a1410;border-radius:2px;
    position:relative;overflow:hidden;
    box-shadow: inset 0 1px 2px rgba(0,0,0,.6);
  }
  .tdk-ribbon-fill{
    position:absolute;left:0;top:0;height:100%;
    background: repeating-linear-gradient(90deg, #5a3a1a 0 6px, #3a2410 6px 12px);
    transition:width .3s linear;
  }

  .tdk-c-holes{display:flex;justify-content:space-around;padding:0 30px;margin-top:6px;}
  .tdk-c-holes i{width:8px;height:8px;border-radius:50%;background:#1a1410;box-shadow:inset 0 1px 2px rgba(0,0,0,.6);}

  /* CONTROL SIDE */
  .tdk-control{
    display:flex;flex-direction:column;gap:18px;
    padding:0 0 0 30px;
  }

  /* LCD */
  .tdk-lcd{
    background:#0a0e08;
    border-radius:8px;
    padding:16px 18px;
    border:1px solid #1a2010;
    font-family:'DM Mono', monospace;
    box-shadow: inset 0 2px 6px rgba(0,0,0,.7);
    position:relative;
  }
  .tdk-lcd::before{
    content:'';position:absolute;inset:0;border-radius:8px;
    background:repeating-linear-gradient(0deg, rgba(126,235,215,.03) 0 1px, transparent 1px 3px);
    pointer-events:none;
  }
  .tdk-lcd-row{display:flex;justify-content:space-between;color:#7eebd7;font-size:11px;letter-spacing:.08em;text-transform:uppercase;}
  .tdk-lcd-mode{color:#a8ff3e;}
  .tdk-lcd-time{font-variant-numeric:tabular-nums;}
  .tdk-lcd-dim{color:#3a6a5a;}
  .tdk-lcd-title{
    font-family:var(--display);font-size:28px;line-height:1;
    color:#a8ff3e;
    margin:10px 0 4px;
    text-transform:uppercase;letter-spacing:-.01em;
    text-shadow:0 0 12px rgba(168,255,62,.4);
  }
  .tdk-lcd-meta{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#7eebd7;opacity:.8;}
  .tdk-scrubber{
    margin-top:14px;height:6px;background:#0a1a14;border-radius:3px;position:relative;overflow:hidden;
  }
  .tdk-scrubber-fill{position:absolute;left:0;top:0;height:100%;background:linear-gradient(90deg, #7eebd7, #a8ff3e);transition:width .12s linear;}
  .tdk-scrubber-head{position:absolute;top:-3px;width:4px;height:12px;background:#a8ff3e;border-radius:1px;transition:left .12s linear;box-shadow:0 0 8px rgba(168,255,62,.7);}
  .tdk-play-hint{
    margin-top:12px;padding:9px 12px;
    border-radius:5px;
    background:rgba(168,255,62,.08);
    border:1px dashed rgba(168,255,62,.3);
    font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;
    color:#7eebd7;text-align:center;
    animation:tdk-hint-pulse 2s ease-in-out infinite;
  }
  @keyframes tdk-hint-pulse{0%,100%{opacity:.7;}50%{opacity:1;}}

  /* TRANSPORT */
  .tdk-transport{
    display:flex;align-items:center;gap:14px;
    padding:10px 4px;
  }
  .tdk-btn{
    background:linear-gradient(180deg, #2a2218, #181208);
    color:var(--cream);
    border:1px solid var(--rule);
    border-radius:8px;
    font-family:'DM Mono', monospace;font-size:14px;
    cursor:pointer;
    transition: transform .06s ease, background .15s ease;
    box-shadow: 0 3px 0 rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.06);
  }
  .tdk-btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.5);}
  .tdk-btn-sm{width:50px;height:42px;}
  .tdk-btn-play{
    width:66px;height:66px;border-radius:50%;font-size:20px;
    background:linear-gradient(180deg, var(--orange), #c2401a);
    color:var(--cream);
    border-color:#5a1f10;
    box-shadow: 0 6px 0 #3a1208, 0 12px 24px rgba(255,90,31,.3), inset 0 1px 0 rgba(255,255,255,.25);
  }
  .tdk-btn-play:active{box-shadow: 0 2px 0 #3a1208, 0 4px 12px rgba(255,90,31,.2), inset 0 1px 0 rgba(255,255,255,.25);}
  .tdk-btn-play.is-playing{background:linear-gradient(180deg, #c2401a, #7a2510);}
  .tdk-btn:focus-visible{outline:2px solid var(--amber);outline-offset:3px;}
  .tdk-btn-play:focus-visible{outline:2px solid var(--amber);outline-offset:3px;}

  /* KNOBS */
  .tdk-knobs{display:flex;gap:18px;margin-left:auto;}
  .tdk-knob{display:flex;flex-direction:column;align-items:center;gap:6px;}
  .tdk-knob-body{
    position:relative;width:54px;height:54px;border-radius:50%;
    background:radial-gradient(circle at 30% 30%, #2a2218, #0a0805);
    border:1px solid var(--rule);
    box-shadow:0 3px 8px rgba(0,0,0,.5), inset 0 -2px 4px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.1);
    cursor:ns-resize;
  }
  .tdk-knob-body:focus-visible{outline:2px solid var(--amber);outline-offset:4px;}
  .tdk-knob-arc{
    position:absolute;inset:-6px;border-radius:50%;
    -webkit-mask: radial-gradient(circle, transparent 60%, black 61%, black 70%, transparent 71%);
            mask: radial-gradient(circle, transparent 60%, black 61%, black 70%, transparent 71%);
    pointer-events:none;
  }
  .tdk-knob-ind{position:absolute;inset:0;display:flex;justify-content:center;}
  .tdk-knob-ind i{width:3px;height:18px;margin-top:6px;border-radius:1px;display:block;}
  .tdk-knob-lbl{font-family:'DM Mono', monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--cream-dim);}

  /* VU METERS */
  .tdk-vu{display:flex;flex-direction:column;gap:6px;padding:12px 16px;background:#0a0805;border-radius:8px;border:1px solid var(--rule);}
  .tdk-vu-row{display:grid;grid-template-columns:14px 1fr 50px;align-items:center;gap:10px;}
  .tdk-vu-lbl{font-family:'DM Mono',monospace;font-size:10px;color:var(--cream-dim);letter-spacing:.1em;}
  .tdk-vu-track{position:relative;height:10px;background:#1a1410;border-radius:2px;overflow:hidden;}
  .tdk-vu-fill{
    position:absolute;left:0;top:0;height:100%;width:100%;transform-origin:left center;transform:scaleX(0);
    background: linear-gradient(90deg, #a8ff3e 0%, #d4e23a 40%, #f0a431 65%, #ff5a1f 85%, #ff2dd1 100%);
    transition:transform .04s linear;
  }
  .tdk-vu-peak{position:absolute;top:0;height:100%;width:2px;background:rgba(255,255,255,.85);transition:left .12s linear;pointer-events:none;}
  .tdk-vu-ticks{position:absolute;inset:0;display:flex;justify-content:space-between;align-items:stretch;padding:0 1px;pointer-events:none;}
  .tdk-vu-ticks span{width:1px;background:rgba(0,0,0,.4);}
  .tdk-vu-num{font-family:'DM Mono',monospace;font-size:9px;color:var(--cream-dim);text-align:right;letter-spacing:.08em;}

  /* TRACK LIST */
  .tdk-tracks{padding:0 30px 22px;}
  .tdk-tracks-head, .tdk-tr{
    display:grid;grid-template-columns:36px 1.5fr 1.5fr 60px 60px 30px;
    gap:14px;align-items:center;padding:10px 12px;
    font-family:'DM Mono', monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;
  }
  .tdk-tracks-head{color:var(--cream-dim);border-bottom:1px solid var(--rule);font-size:10px;opacity:.7;}
  .tdk-tr{
    background:transparent;border:0;color:var(--cream);
    border-bottom:1px solid var(--rule);
    cursor:pointer;text-align:left;
    transition:background .12s ease, padding .12s ease;
    width:100%;
  }
  .tdk-tr:hover{background:rgba(245,234,208,.04);padding-left:18px;}
  .tdk-tr.is-active{background:color-mix(in oklab, var(--orange) 14%, transparent);color:var(--cream);}
  .tdk-tr.is-active .tdk-tr-name{color:var(--orange);}
  .tdk-tr-n{font-variant-numeric:tabular-nums;color:var(--cream-dim);}
  .tdk-tr-name{font-family:var(--display);font-size:18px;text-transform:uppercase;letter-spacing:-.01em;line-height:1;}
  .tdk-tr-rel{color:var(--cream-dim);}
  .tdk-tr-bpm, .tdk-tr-time{color:var(--cream-dim);text-align:right;font-variant-numeric:tabular-nums;}
  .tdk-tr-play{color:var(--orange);text-align:center;}

  .tdk-foot{
    padding:14px 30px 22px;border-top:1px solid var(--rule);
    display:flex;justify-content:space-between;gap:20px;
    font-family:'DM Mono', monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;
    color:var(--cream-dim);
  }

  .tdk-tracks-hint{display:none;padding:4px 12px 8px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--cream-dim);opacity:.6;}

  @media (max-width:900px){
    .mini-deck{grid-template-columns:1fr;gap:18px;padding:20px;}
    .mini-controls{justify-content:flex-end;}
    .mini-time{margin-right:auto;}
    .tdk-face{grid-template-columns:1fr;}
    .tdk-control{padding:0;}
    .tdk-tracks-head, .tdk-tr{grid-template-columns:30px 1fr 50px 26px;}
    .tdk-tracks-head .h-rel, .tdk-tr-rel, .tdk-tracks-head .h-bpm, .tdk-tr-bpm{display:none;}
    .tdk-tracks-hint{display:block;}
    .tdk-foot{flex-direction:column;}
  }
  @media (max-width:480px){
    .mini-deck{padding:16px;}
    .mini-now{font-size:clamp(28px, 9vw, 34px);line-height:1;}
    .mini-controls{flex-wrap:wrap;gap:6px;}
    .mini-time{width:100%;margin-right:0;order:-1;font-size:10px;}
    .mini-btn{flex:1;min-width:0;justify-content:center;}
    .mini-play{flex:1.5;}
    .mini-picks{gap:6px;}
    .mini-pick{padding:7px 9px;font-size:9px;}
    .tdk-shell{border-radius:10px;}
    .tdk-head{padding:16px;}
    .tdk-title{font-size:24px;line-height:1.05;}
    .tdk-face{padding:16px;gap:16px;}
    .tdk-cassette,.tdk-control{min-width:0;width:100%;max-width:100%;}
    .tdk-cassette{padding:16px 14px;border-radius:8px;}
    .tdk-cassette-inner{padding:12px 12px 16px;}
    .tdk-c-label-band{padding:9px 10px;gap:8px;}
    .tdk-c-title{font-size:20px;}
    .tdk-c-sub{font-size:9px;letter-spacing:.04em;}
    .tdk-c-window{gap:10px;margin:14px 0;}
    .tdk-reels{grid-template-columns:minmax(0,1fr) 56px minmax(0,1fr);gap:8px;padding-left:0;padding-right:0;}
    .tdk-reel{max-width:96px;}
    .tdk-ribbon{width:56px;}
    .tdk-lcd{padding:14px;}
    .tdk-lcd-title{font-size:24px;line-height:1.05;}
    .tdk-buttons{gap:8px;}
    .tdk-btn-sm{width:44px;height:40px;}
    .tdk-play{width:58px;height:58px;}
    .tdk-knob{width:48px;height:48px;}
    .tdk-vu-row{grid-template-columns:12px 1fr 44px;gap:8px;}
    .tdk-tracks{padding:10px 0 12px;}
    .tdk-tracks-head, .tdk-tr{grid-template-columns:28px minmax(0,1fr) 42px 24px;padding-left:12px;padding-right:12px;gap:8px;}
    .tdk-tr-name{font-size:16px;line-height:1.05;}
    .tdk-foot{padding:12px 16px 16px;gap:8px;line-height:1.45;}
  }
  @media (prefers-reduced-motion: reduce){
    .mini-btn, .mini-pick, .mini-progress-fill{transition:none;}
    .tdk-reel.spin svg{animation:none;}
    .tdk-tr, .tdk-scrubber-fill, .tdk-scrubber-head, .tdk-vu-fill, .tdk-vu-peak{transition:none;}
  }
`;

// Export to window so v3-mount.jsx can use it
Object.assign(window, { TapeDeck, TRACKS });
