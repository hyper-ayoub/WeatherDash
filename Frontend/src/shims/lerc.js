import * as lercModule from 'lerc';

// Provide a default export alongside named exports so ESM consumers
// (or libraries expecting a default) will work with the CommonJS package.
const _default = (lercModule && lercModule.default) ? lercModule.default : lercModule;

export default _default;
export * from 'lerc';
