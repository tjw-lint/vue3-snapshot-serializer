
export const loadOptions = function () {
  globalThis.vueSnapshots = globalThis.vueSnapshots || {};

  const booleanDefaults = {
    removeDataVId: true,
    removeDataTest: true,
    removeDataTestid: true,
    removeDataTestId: true,
    removeDataQa: false,
    removeDataCy: false,
    removeDataPw: false,
    removeIdTest: false,
    removeClassTest: false
  };

  for (const booleanSetting in booleanDefaults) {
    if (typeof(globalThis.vueSnapshots[booleanSetting]) !== 'boolean') {
      globalThis.vueSnapshots[booleanSetting] = booleanDefaults[booleanSetting];
    }
  }
};
