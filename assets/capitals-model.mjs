import { createBadgeModel as createSharedBadgeModel } from './badge-model.mjs';

// Five physical buttons plus all eight capacitive controls. The shared adapter
// applies orientation once before delivering these logical navigation actions.
const PROFILE = Object.freeze({
  physical: Object.freeze({ left:16, right:8, select:4, up:2, down:1, back:8192, menu:16384, home:32 }),
  actions: [[16,'left'],[8,'right'],[4,'select'],[2,'up'],[1,'down'],[256,'left'],[512,'right'],[1024,'select'],[8192,'back'],[2048,'up'],[4096,'down'],[16384,'menu'],[32,'home']],
  canvasLabel: 'Actual GitHub Universe 2026 badge running World Capitals. Drag to orbit, scroll to zoom, and press its physical buttons or touch pads.',
});

export function createBadgeModel(options) {
  return createSharedBadgeModel(options, PROFILE);
}
