// Behavior checks for the static landing's exclusive playback coordinator.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../landing.js'), 'utf8')
  .split('  // One visible video plays at a time, including the decorative hero background.')[1]
  .split('  // End exclusive video playback.')[0];
function events(object = {}) {
  const listeners = {};
  return Object.assign(object, {
    addEventListener(name, listener) { (listeners[name] ||= []).push(listener); },
    emit(name) { (listeners[name] || []).forEach(listener => listener()); }
  });
}
function classes(initial = []) {
  const values = new Set(initial);
  return { contains: value => values.has(value), add: value => values.add(value),
    remove: value => values.delete(value), toggle: (value, enabled) => enabled ? values.add(value) : values.delete(value) };
}
let scroll = 0, nextFrame = 0;
const frames = new Map();
function target(top, height) {
  return { classList: classes(), getBoundingClientRect: () => ({ top: top - scroll,
    bottom: top + height - scroll, height, left: 0, right: 500 }) };
}
const scene = target(0, 1000);
const targets = [scene, target(1200, 600), target(1900, 600), target(2600, 600)];
const buttons = targets.map((_, i) => i ? events({ hidden: true }) : null);
const videos = targets.map((figure, i) => {
  const attributes = {};
  figure.querySelector = () => buttons[i];
  return events({ classList: classes(i ? ['product-demo'] : ['hero-video']),
    dataset: { src: `demo-${i}.mp4` }, paused: true, readyState: 2, currentTime: 0,
    closest: () => i ? figure : null, getAttribute: name => attributes[name] || null,
    set src(value) { attributes.src = value; },
    play() { this.paused = false; this.emit('playing'); return Promise.resolve(); },
    pause() { this.paused = true; }
  });
});
const preference = events({ matches: false });
const connection = events({ saveData: false });
const document = events({ hidden: false, querySelectorAll: () => videos });
const window = events({ innerWidth: 1440, matchMedia: () => preference });
const context = { document, window, navigator: { connection }, scene,
  navigation: { classList: { contains: () => scroll >= 1000 } }, innerWidth: 1440, innerHeight: 800,
  Promise, Math, requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; } };
const active = () => videos.flatMap((video, i) => video.paused ? [] : [i]);
async function settle() {
  for (let n = 0; n < 8; n++) {
    const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback());
    await Promise.resolve();
  }
}
async function move(value) { scroll = value; window.emit('scroll'); await settle(); }
(async () => {
  vm.runInNewContext(`(() => { ${source} })()`, context);
  await settle();
  assert.deepEqual(active(), [0], 'only hero starts initially');
  assert.equal(videos[1].getAttribute('src'), null, 'offscreen demos remain unloaded');
  await move(1000); assert.deepEqual(active(), [1]);
  videos[1].currentTime = 12;
  await move(1700); assert.deepEqual(active(), [2]);
  assert.equal(videos[1].currentTime, 12, 'pause preserves playback position');
  await move(1000); assert.deepEqual(active(), [1]);
  assert.equal(videos[1].currentTime, 12, 'return resumes rather than resets');
  buttons[1].emit('click'); await settle();
  assert.equal(videos[1].currentTime, 0, 'restart seeks to zero');
  await move(1700);
  videos[1].paused = false; videos[1].emit('playing');
  assert.deepEqual(active(), [2], 'late playing event cannot start a passed card');
  document.hidden = true; document.emit('visibilitychange');
  assert.deepEqual(active(), [], 'hidden tab pauses immediately');
  document.hidden = false; document.emit('visibilitychange'); await settle();
  assert.deepEqual(active(), [2]);
  preference.matches = true; preference.emit('change'); await settle();
  assert.deepEqual(active(), [], 'reduced motion disables automatic playback');
  buttons[2].emit('click'); await settle(); assert.deepEqual(active(), [2], 'explicit replay still works');
  await move(2400); assert.deepEqual(active(), [], 'scroll clears explicit motion override');
  preference.matches = false; connection.saveData = true; preference.emit('change'); await settle();
  assert.deepEqual(active(), [], 'save-data disables automatic loading/playback');
  connection.saveData = false; connection.emit('change'); await settle(); assert.deepEqual(active(), [3]);
  const originalPlay = videos[1].play;
  let resolvePending;
  videos[1].play = function () {
    this.paused = false;
    return new Promise(resolve => { resolvePending = resolve; });
  };
  await move(1000); await move(1700); await move(1000);
  videos[1].play = originalPlay;
  resolvePending(); await settle();
  assert.deepEqual(active(), [1], 'return during pending play resumes after the interrupted attempt settles');
  await move(10000); assert.deepEqual(active(), [], 'all videos pause outside their sections');
  console.log('PASS: exclusive playback, lazy loading, resume/restart, rapid scroll guard, hidden tab, reduced motion and save-data.');
})().catch(error => { console.error(error); process.exitCode = 1; });
