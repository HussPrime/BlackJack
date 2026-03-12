// Fix for rolldown-vite@7.x + vitest@2.x incompatibility.
//
// rolldown-vite's SSR transform wraps every export as:
//   __vite_ssr_exportName__("FOO", () => { try { return FOO } catch {} });
//
// vite-node runs modules via:
//   async (__vite_ssr_exports__, __vite_ssr_import__, ...)=>{{ code }}
// and vitest's VitestExecutor.prepareContext() builds the context object whose
// keys become those parameter names.
//
// __vite_ssr_exportName__ is NOT in the parameter list → ReferenceError.
// Fix: patch VitestExecutor.prototype.prepareContext to add it, closing over
// the module's own __vite_ssr_exports__ so the name→getter mapping is correct.

import { VitestExecutor } from 'vitest/execute';

const _origPrepare = VitestExecutor.prototype.prepareContext;

VitestExecutor.prototype.prepareContext = function (context) {
  const result = _origPrepare.call(this, context);

  // Each module gets its own exports object; capture it here.
  const exportsObj = result.__vite_ssr_exports__;

  result.__vite_ssr_exportName__ = function (name, getter) {
    if (!exportsObj || typeof name !== 'string') return;
    Object.defineProperty(exportsObj, name, {
      get: getter,
      enumerable: true,
      configurable: true,
    });
  };

  return result;
};
