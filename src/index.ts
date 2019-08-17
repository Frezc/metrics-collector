
interface CollectorOptions {
  /**
   * default ['navigation', 'resource', 'measure', 'paint']
   */
  entryTypes?: string[];
  callback?(entries: PerformanceEntry[]): void;
  /**
   * callback will not triggered at start of throttle, so you should not set a large number.
   * unit: ms.
   */
  throttle?: number;
  /**
   * Due to parallel loading behaviour of resource and the completion of navigation entry, we set observer in load event and retrieve previous entries.
   * If you use some polyfill(like https://github.com/tdresser/performance-observer-tracing) poll entries by intervals, you should set ignoreInitialEntries to true to disable it.
   */
  ignoreInitialEntries?: boolean;
  /**
   * default we will ingore initiatorType === 'fetch' || initiatorType === 'xmlhttprequest' || initiatorType === 'beacon'
   * If you need collect ajax resource, set filter to undefined.
   * Remember send request in callback will also trigger callback. You should check name of entry to skip metric collect request.
   */
  filter?(entry: PerformanceEntry): void;
}

function defaultFilter(entry: PerformanceEntry & { initiatorType?: string }) {
  return ['fetch', 'xmlhttprequest', 'beacon'].indexOf(entry.initiatorType || '') === -1;
}

export function initCollector(option: CollectorOptions = {}) {
  const { entryTypes = ['navigation', 'resource', 'measure', 'paint'], ignoreInitialEntries, filter = defaultFilter } = option;

  let observer: PerformanceObserver;
  let entrisBuffer: PerformanceEntry[] = [];

  let workerId: number | null = null;

  function triggerCallback() {
    const filteredEntries = entrisBuffer.filter(filter);
    if (filteredEntries.length > 0) {
      option.callback && option.callback(filteredEntries);
    }
    entrisBuffer = [];
  }

  function tryTriggerCallback() {
    if (option.throttle && option.throttle > 0) {
      if (!workerId) {
        workerId = setTimeout(() => {
          triggerCallback();
          workerId = null;
        }, option.throttle);
      }
    } else {
      triggerCallback();
    }
  }

  function mountObserver() {
    if (!ignoreInitialEntries) {
      // we won't use navigation here because it's imcomplete, e.g. loadEventEnd is 0
      entrisBuffer = performance.getEntries().filter((e) => e.entryType !== 'navigation' && entryTypes.indexOf(e.entryType) > -1);
      tryTriggerCallback();
    }
    observer = new PerformanceObserver(perfObserver);
    observer.observe({ entryTypes })
    function perfObserver(entries: PerformanceObserverEntryList, observer: PerformanceObserver) {
      entrisBuffer.push(...entries.getEntries());
      tryTriggerCallback();
    }
  }
  window.addEventListener('load', mountObserver);

  return {
    cancelCollector: () => {
      observer && observer.disconnect();
      window.removeEventListener('load', mountObserver);
      if (workerId) {
        clearTimeout(workerId);
        workerId = null;
      }
    },
    getEntries() {
      return entrisBuffer;
    },
    /**
     * get and empty entries
     */
    takeEntries() {
      const re = entrisBuffer;
      entrisBuffer = [];
      return re;
    }
  }
}

window.initCollector = initCollector;

declare global {
  interface Window {
    initCollector: typeof initCollector;
  }
}
