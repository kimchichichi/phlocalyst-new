// v3-mount.jsx — wires the Tweaks panel + Tape deck into the page.
// Tape deck and tweaks panel get their own React roots so neither
// re-renders the other unnecessarily.

function applyTweaks(t) {
  const root = document.documentElement;
  root.dataset.theme = t.theme;
  root.dataset.display = t.display;
  root.style.setProperty('--marquee-dur', t.marqueeSpeed + 's');
  root.style.setProperty('--grain', String(t.grain));
  root.style.setProperty('--trumpet-display', t.showTrumpet ? 'block' : 'none');
  root.style.setProperty('--trumpet-motion-state', t.vinylSpin ? 'running' : 'paused');
}

function PhloTweaks() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <TweaksPanel title="Phlocalyst tweaks">
      <TweakSection label="Theme" />
      <TweakSelect
        label="Palette"
        value={t.theme}
        options={[
          { value: 'warm',     label: 'Warm Coal (default)' },
          { value: 'midnight', label: 'Midnight Blue' },
          { value: 'cream',    label: 'Cream Day' },
          { value: 'acid',     label: 'Acid Punk' },
        ]}
        onChange={(v) => setTweak('theme', v)}
      />
      <TweakSelect
        label="Display font"
        value={t.display}
        options={[
          { value: 'boldonse',     label: 'Boldonse (default)' },
          { value: 'bagel',        label: 'Bagel Fat One' },
          { value: 'bigshoulders', label: 'Big Shoulders' },
        ]}
        onChange={(v) => setTweak('display', v)}
      />

      <TweakSection label="Motion" />
      <TweakSlider
        label="Marquee speed"
        value={t.marqueeSpeed} min={10} max={80} step={2} unit="s"
        onChange={(v) => setTweak('marqueeSpeed', v)}
      />
      <TweakSlider
        label="Film grain"
        value={Math.round(t.grain * 100)} min={0} max={20} step={1} unit="%"
        onChange={(v) => setTweak('grain', v / 100)}
      />

      <TweakSection label="Decor" />
      <TweakToggle
        label="Trumpet motif"
        value={t.showTrumpet}
        onChange={(v) => setTweak('showTrumpet', v)}
      />
      <TweakToggle
        label="Animate horn (bob)"
        value={t.vinylSpin}
        onChange={(v) => setTweak('vinylSpin', v)}
      />
    </TweaksPanel>
  );
}

// Mount tape deck
const tapeMount = document.getElementById('tape-deck-mount');
if (tapeMount) ReactDOM.createRoot(tapeMount).render(<TapeDeck />);

// Mount tweaks panel
const tweaksMount = document.getElementById('tweaks-mount');
if (tweaksMount) ReactDOM.createRoot(tweaksMount).render(<PhloTweaks />);
