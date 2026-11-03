import { createBadgeModel as createSharedBadgeModel } from './badge-model.mjs';

// Keep the BM83 audio-demo action names and original physical/touch mapping.
const PROFILE = Object.freeze({
  physical: Object.freeze({ previous:16, next:8, play:4, 'volume-up':2, 'volume-down':1, settings:16384, home:32 }),
  actions: [[16,'previous'],[8,'next'],[4,'play'],[2,'volume-up'],[1,'volume-down'],[256,'previous'],[512,'next'],[1024,'play'],[2048,'volume-up'],[4096,'volume-down'],[16384,'settings'],[32,'home'],[8192,'home']],
});

export function createBadgeModel(options) {
  return createSharedBadgeModel(options, PROFILE);
}
