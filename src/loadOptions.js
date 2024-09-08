export const booleanDefaults = {
  removeServerRendered: true,
  removeDataVId: true,
  removeDataTest: true,
  removeDataTestid: true,
  removeDataTestId: true,
  removeDataQa: false,
  removeDataCy: false,
  removeDataPw: false,
  removeIdTest: false,
  removeClassTest: false,
  removeComments: false,
  clearInlineFunctions: false
};

export const loadOptions = function () {
  globalThis.vueSnapshots = globalThis.vueSnapshots || {};

  /**
   * Set boolean settings
   */

  for (const booleanSetting in booleanDefaults) {
    if (typeof(globalThis.vueSnapshots[booleanSetting]) !== 'boolean') {
      globalThis.vueSnapshots[booleanSetting] = booleanDefaults[booleanSetting];
    }
  }

  /**
   * Clean up settings
   */

  const permittedKeys = [
    ...Object.keys(booleanDefaults)
  ];
  const allKeys = Object.keys(globalThis.vueSnapshots);

  for (const key of allKeys) {
    if (!permittedKeys.includes(key)) {
      delete globalThis.vueSnapshots[key];
    }
  }
};
