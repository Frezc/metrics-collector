import { initCollector } from '../src';

initCollector({
  callback: (entries) => {
    console.log('collector', entries)
  },
  throttle: 2000,
});
