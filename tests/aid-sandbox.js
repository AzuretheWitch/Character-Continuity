'use strict';
/*
 * aid-sandbox.js - a faithful-enough AI Dungeon scripting sandbox.
 *
 * Loads the Character-Continuity Library into a vm context with the free globals
 * the platform supplies, and exposes the real CharacterContinuity function.
 *
 * The Library file is only ever read, never modified.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// The Library sits one level up from tests/. Override with CC_LIBRARY if needed.
const DEFAULT_LIBRARY =
  process.env.CC_LIBRARY || path.join(__dirname, '..', 'Library');

// ---------------------------------------------------------------------------
// Story card model
// ---------------------------------------------------------------------------
// AID story cards are plain objects on a mutable global array. Script-created
// cards get a platform-assigned id and an EMPTY visible title; the script is
// expected to set `.title` itself afterwards (Character-Continuity does exactly
// that via restoreVisibleCardTitle / restoreRawVisibleCardTitle).
function makeIdFactory() {
  let n = 0;
  const hex = (s) => s.toString(16).padStart(4, '0');
  return () => {
    n += 1;
    return '00000000-0000-4000-8000-' + hex(n >> 16) + hex(n & 0xffff) + '0000';
  };
}

/**
 * @param {object} opts
 * @param {string}  [opts.libraryPath]
 * @param {object}  [opts.state]        initial state (default {})
 * @param {Array}   [opts.history]      initial history (default [])
 * @param {Array}   [opts.storyCards]   initial cards (default [])
 * @param {object}  [opts.info]         initial info
 * @param {boolean} [opts.dedupeKeys]   emulate AID duplicate-key rejection (default true)
 * @param {boolean} [opts.captureLogs]  keep log() output (default true)
 */
function createSandbox(opts) {
  opts = opts || {};
  const libraryPath = opts.libraryPath || DEFAULT_LIBRARY;
  const source = fs.readFileSync(libraryPath, 'utf8');
  const nextId = makeIdFactory();
  const logs = [];

  // The array identity must never change: the script captures `const cards = storyCards`
  // once per invocation, and the platform hands back the same array every hook.
  const storyCards = [];
  (opts.storyCards || []).forEach((c) => storyCards.push(normaliseCard(c, nextId)));

  const sandbox = {
    state: opts.state ? JSON.parse(JSON.stringify(opts.state)) : {},
    history: opts.history ? opts.history.slice() : [],
    storyCards: storyCards,
    text: '',
    info: Object.assign(
      { actionCount: 0, maxChars: 8000, memoryLength: 0, characterNames: [] },
      opts.info || {}
    ),

    // ---- platform API -----------------------------------------------------
    addStoryCard: function (keys, entry, type) {
      const k = keys === undefined || keys === null ? '' : String(keys);
      // AID refuses to create a second card with identical keys.
      if (opts.dedupeKeys !== false && storyCards.some((c) => String(c.keys) === k)) {
        return false;
      }
      storyCards.push({
        id: nextId(),
        title: '',
        keys: k,
        entry: entry === undefined || entry === null ? '' : String(entry),
        type: type === undefined || type === null ? 'class' : String(type),
        description: '',
        useForCharacterCreation: false
      });
      return true;
    },

    removeStoryCard: function (index) {
      const i = Number(index);
      if (!Number.isInteger(i) || i < 0 || i >= storyCards.length) {
        // AID throws on an out-of-range removal.
        throw new Error('Story card index out of range: ' + index);
      }
      storyCards.splice(i, 1);
      return true;
    },

    updateStoryCard: function (index, keys, entry, type) {
      const i = Number(index);
      if (!Number.isInteger(i) || i < 0 || i >= storyCards.length) {
        throw new Error('Story card index out of range: ' + index);
      }
      const card = storyCards[i];
      card.keys = keys === undefined || keys === null ? '' : String(keys);
      card.entry = entry === undefined || entry === null ? '' : String(entry);
      card.type = type === undefined || type === null ? '' : String(type);
      return true;
    },

    log: function () {
      if (opts.captureLogs === false) return;
      const args = Array.prototype.slice.call(arguments);
      logs.push(args.map((a) => (typeof a === 'string' ? a : safeJson(a))).join(' '));
    },

    console: { log: function () {}, warn: function () {}, error: function () {} }
  };

  const context = vm.createContext(sandbox);
  vm.runInContext(source, context, {
    filename: path.resolve(libraryPath),
    displayErrors: true
  });

  const CharacterContinuity = vm.runInContext('CharacterContinuity', context);
  if (typeof CharacterContinuity !== 'function') {
    throw new Error('CharacterContinuity did not evaluate to a function');
  }

  return {
    context: context,
    sandbox: sandbox,
    logs: logs,
    storyCards: storyCards,
    CharacterContinuity: CharacterContinuity,

    /** Run one hook exactly as the platform would: set `text`, call, return result. */
    runHook: function (hook, inputText) {
      sandbox.text = inputText;
      context.text = inputText;
      return CharacterContinuity(hook, inputText);
    },

    /**
     * Round-trip `state` through JSON exactly as the platform does between
     * script executions. Returns a report so callers can detect loss.
     */
    persistState: function () {
      const before = sandbox.state;
      let serialised;
      try {
        serialised = JSON.stringify(before);
      } catch (err) {
        return { ok: false, error: 'stringify: ' + err.message, bytes: 0, lost: [] };
      }
      if (serialised === undefined) {
        return { ok: false, error: 'state serialised to undefined', bytes: 0, lost: [] };
      }
      const after = JSON.parse(serialised);
      const lost = diffLostKeys(before, after, '$');
      sandbox.state = after;
      context.state = after;
      return {
        ok: lost.length === 0,
        bytes: Buffer.byteLength(serialised, 'utf8'),
        lost: lost,
        error: null
      };
    }
  };
}

function normaliseCard(c, nextId) {
  return {
    id: c.id || nextId(),
    title: typeof c.title === 'string' ? c.title : '',
    keys: c.keys === undefined || c.keys === null ? '' : String(c.keys),
    entry: c.entry === undefined || c.entry === null ? '' : String(c.entry),
    type: c.type === undefined || c.type === null ? 'class' : String(c.type),
    description: typeof c.description === 'string' ? c.description : '',
    useForCharacterCreation: !!c.useForCharacterCreation
  };
}

function safeJson(v) {
  try {
    return JSON.stringify(v);
  } catch (e) {
    return String(v);
  }
}

/**
 * Walk `before` and report every path whose value did not survive JSON.
 * Catches functions, undefined, Map/Set, NaN/Infinity, cycles.
 */
function diffLostKeys(before, after, prefix, seen) {
  const out = [];
  seen = seen || new Set();
  if (before === null || typeof before !== 'object') {
    if (typeof before === 'number' && !Number.isFinite(before) && after === null) {
      out.push(prefix + ' (' + String(before) + ' -> null)');
    }
    return out;
  }
  if (seen.has(before)) return out;
  seen.add(before);
  if (before instanceof Map) return [prefix + ' (Map -> {})'];
  if (before instanceof Set) return [prefix + ' (Set -> {})'];
  if (Array.isArray(before)) {
    if (!Array.isArray(after)) return [prefix + ' (array lost)'];
    for (let i = 0; i < before.length; i++) {
      if (typeof before[i] === 'function') out.push(prefix + '[' + i + '] (function -> null)');
      else out.push.apply(out, diffLostKeys(before[i], after[i], prefix + '[' + i + ']', seen));
    }
    return out;
  }
  for (const k of Object.keys(before)) {
    const bv = before[k];
    const p = prefix + '.' + k;
    if (typeof bv === 'function') { out.push(p + ' (function dropped)'); continue; }
    if (typeof bv === 'undefined') { out.push(p + ' (undefined dropped)'); continue; }
    if (typeof bv === 'symbol') { out.push(p + ' (symbol dropped)'); continue; }
    if (!(k in (after || {}))) { out.push(p + ' (key dropped)'); continue; }
    out.push.apply(out, diffLostKeys(bv, after[k], p, seen));
  }
  return out;
}

module.exports = { createSandbox: createSandbox, DEFAULT_LIBRARY: DEFAULT_LIBRARY, diffLostKeys: diffLostKeys };
