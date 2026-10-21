export function playSound() {
  try {
    const context = new AudioContext();
    const osc = context.createOscillator(),
      gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    osc.frequency.setValueAtTime(
      660,
      context.currentTime
    );
    osc.frequency.setValueAtTime(
      880,
      context.currentTime + .1
    );
    gain.gain.setValueAtTime(
      .08,
      context.currentTime
    );
    gain.gain.exponentialRampToValueAtTime(
      .001,
      context.currentTime + .3
    );
    osc.start();
    osc.stop(context.currentTime + .3);
    osc.onended = () => void context.close();
  } catch {/* Audio is optional; payment remains completed. */}
}
