export const loadOptions = function () {
  globalThis.vueSnapshots = globalThis.vueSnapshots || {};

  if (typeof(globalThis.vueSnapshots.removeDataVId) !== 'boolean') {
    globalThis.vueSnapshots.removeDataVId = true;
  }
};
