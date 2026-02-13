const config = require('../config');

/**
 * Limits concurrent worker runs so we don't spawn too many Python/CPU-heavy processes at once.
 */
const MAX_CONCURRENT = config.WORKER_MAX_CONCURRENT;
const queue = [];
let running = 0;

function runNext() {
  if (running >= MAX_CONCURRENT || queue.length === 0) return;
  const { fn } = queue.shift();
  running += 1;
  Promise.resolve()
    .then(() => fn())
    .finally(() => {
      running -= 1;
      runNext();
    });
}

/**
 * Run a worker function with concurrency limit. fn() should return a Promise.
 */
function run(fn) {
  queue.push({ fn });
  runNext();
}

module.exports = { run };
