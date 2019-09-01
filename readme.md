
This script is a tool for collecting frontend metrics.

You should check [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver#Browser_compatibility) about `PerformanceObserver` or use a [polyfill](https://github.com/fastly/performance-observer-polyfill) before use this.

# Install
```sh
yarn add performance-resource-collector
```

# Usage
```js
import { initCollector } from 'performance-resource-collector';

initCollector({
  callback: (entries) => {
    navigator.sendBeacon("http://metric-collect-service/resources", JSON.stringify(entries))
  },
  onUnsupported: () => {
    console.log('unsupport!');
  },
  onSetUp: () => {
    console.log('collecting performance entries...');
  },
  throttle: 2000,
});
```

or see [example](https://github.com/Frezc/metrics-collector/blob/master/example/index.ts)
