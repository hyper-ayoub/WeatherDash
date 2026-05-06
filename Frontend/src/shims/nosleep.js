import * as nosleepModule from 'nosleep.js';

// Provide a default export alongside named exports so ESM consumers
// (or libraries expecting a default) will work with the CommonJS package.
const _default = (nosleepModule && nosleepModule.default) ? nosleepModule.default : nosleepModule;

export default _default;
export * from 'nosleep.js';
