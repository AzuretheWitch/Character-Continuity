'use strict';
/* verify.js - one command that proves the harness works end to end. */
const { execFileSync } = require('child_process');
const path = require('path');

function run(args) {
  console.log('\n$ node ' + args.join(' ') + '\n');
  try {
    const out = execFileSync(process.execPath, args.map((a, i) => (i ? a : path.join(__dirname, a))), {
      encoding: 'utf8',
      cwd: __dirname
    });
    process.stdout.write(out);
    return true;
  } catch (err) {
    process.stdout.write(err.stdout || '');
    process.stderr.write(err.stderr || '');
    return false;
  }
}

const a = run(['run-scenario.js', path.join(__dirname, 'scenarios', 'smoke.json')]);
const b = run(['run-scenario.js', path.join(__dirname, 'scenarios', 'cco.json')]);
const c = run(['probe-adversarial.js']);
const d = run(['probe-known-crash.js']); // intentionally exits 1 while the bug lives
const e = run(['probe-error-boundary.js']);
console.log('\n================================');
console.log('smoke scenario   : ' + (a ? 'PASS' : 'FAIL'));
console.log('cco scenario     : ' + (b ? 'PASS' : 'FAIL'));
console.log('adversarial      : ' + (c ? 'PASS' : 'FAIL'));
console.log('known crash      : ' + (d ? 'FIXED' : 'STILL REPRODUCES (expected on v2.01)'));
console.log('error boundary   : ' + (e ? 'HOLDS' : 'FAIL'));
process.exitCode = a && b && c && d && e ? 0 : 1;
