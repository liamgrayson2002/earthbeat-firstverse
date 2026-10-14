const canvas = document.getElementById("scope"),
  ctx = canvas.getContext("2d"),
  play = document.getElementById("play"),
  stop = document.getElementById("stop"),
  mode = document.getElementById("mode");
let audioCtx = null,
  osc = null,
  gain = null,
  timer = null,
  t = 0,
  running = false;
const config = {
  temperature: { base: 180, amp: 90, color: "#ffbd73", name: "Orange" },
  rain: { base: 120, amp: 55, color: "#5de5ff", name: "Cyan" },
  vegetation: { base: 150, amp: 70, color: "#91f5b0", name: "Green" },
};
function value() {
  if (mode.value === "temperature")
    return 0.5 + 0.32 * Math.sin(t * 0.75) + 0.13 * Math.sin(t * 2.1);
  if (mode.value === "rain")
    return 0.45 + 0.36 * Math.sin(t * 1.45) + 0.12 * Math.sin(t * 4.6);
  return 0.55 + 0.25 * Math.sin(t * 0.5) + 0.17 * Math.sin(t * 1.8);
}
function frame() {
  const c = config[mode.value],
    v = value();
  ctx.fillStyle = "#06101c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#16354d";
  ctx.lineWidth = 1;
  for (let y = 50; y < 300; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  ctx.beginPath();
  for (let x = 0; x < canvas.width; x++) {
    const tt = t + x * 0.025;
    const y =
      150 -
      (0.5 + 0.32 * Math.sin(tt * 0.75) + 0.13 * Math.sin(tt * 2.1) - 0.5) *
        170 *
        (mode.value === "rain" ? 0.85 : 1);
    x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.strokeStyle = c.color;
  ctx.lineWidth = 4;
  ctx.stroke();
  document.getElementById("signal").textContent = v.toFixed(2);
  document.getElementById("pitch").textContent =
    Math.round(c.base + v * c.amp) + " Hz";
  document.getElementById("color").textContent = c.name;
  if (running) t += 0.035;
  requestAnimationFrame(frame);
}
function start() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    osc = audioCtx.createOscillator();
    gain = audioCtx.createGain();
    osc.type = "sine";
    gain.gain.value = 0;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
  }
  audioCtx.resume();
  running = true;
  gain.gain.setTargetAtTime(0.06, audioCtx.currentTime, 0.03);
  if (!timer)
    timer = setInterval(() => {
      const c = config[mode.value],
        v = value();
      osc.frequency.setTargetAtTime(
        c.base + v * c.amp,
        audioCtx.currentTime,
        0.04,
      );
    }, 40);
}
function halt() {
  running = false;
  if (gain) gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
}
play.onclick = start;
stop.onclick = halt;
mode.onchange = () => {
  if (audioCtx && running) start();
};
frame();
