import { initCollector } from '../src';
import prom from 'promjs';
import { exportMetrics } from 'promjs-export';

const registry = prom();
const unsupportedCounter = registry.create('counter', 'collector_unsupported_total', 'A counter for browser support for collector');
const setupCounter = registry.create('counter', 'collector_setup_total', 'A counter for collector setup');

function sendMetrics() {
  navigator.sendBeacon("http://localhost:8080/custom_metrics", JSON.stringify(exportMetrics(registry)));
  registry.reset();
}

initCollector({
  callback: (entries) => {
    navigator.sendBeacon("http://localhost:8080/resources", JSON.stringify(entries))
  },
  onUnsupported: () => {
    unsupportedCounter.inc();
    sendMetrics();
  },
  onSetUp: () => {
    setupCounter.inc();
    sendMetrics();
  },
  throttle: 2000,
});
