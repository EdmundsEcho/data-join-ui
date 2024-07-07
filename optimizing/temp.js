(function s(e) {
  e.__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK.helpers = {
    parseData: (e) => {
      const t = function (e, n) {
        return 'function' == typeof n
          ? 'function () {}'
          : ((o = n),
            (
              'HTMLElement' in window
                ? o instanceof HTMLElement
                : 'object' == typeof o &&
                  1 === o.nodeType &&
                  'string' == typeof o.nodeName
            )
              ? `<${n.tagName}> HTMLElemet`
              : n instanceof Set
              ? `Set [${Array.from(n).toString()}]`
              : n instanceof Map
              ? 'Map ' + JSON.stringify(Object.fromEntries(n), t)
              : n instanceof WeakSet
              ? 'WeekSet []'
              : n instanceof WeakMap
              ? 'WeakMap {}'
              : ((e, t) => e.startsWith('__reactFiber') && t.stateNode)(e, n)
              ? '<REACT NODE>'
              : n);
        var o;
      };
      return JSON.stringify(e, t);
    },
    loadHookHelper: () => (
      e.postMessage(
        {
          type: '__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK_EVENT',
          subType: 'LOAD_HOOK_HELPER',
        },
        '*',
      ),
      new Promise((t, n) => {
        e.__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK.onHookHelperLoad = () => {
          e.__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK.hookHelperLoaded ? t() : n();
        };
      })
    ),
  };
})(window);
