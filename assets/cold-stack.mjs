const explorer = typeof document === 'undefined' ? null : document.querySelector('[data-stack-explorer]');
if (explorer) {
  const range = explorer.querySelector('#stack-separation');
  const separation = explorer.querySelector('#separation-value');
  const drawings = explorer.querySelectorAll('[data-stack-drawing]');
  const controls = explorer.querySelector('.stack-controls');
  const updateStack = () => {
    const value = Number(range.value);
    drawings.forEach(drawing => {
      const minimumGap = Number(drawing.dataset.stackMinGap || 24);
      drawing.querySelectorAll('[data-stack-level]').forEach(layer => {
        const index = Number(layer.dataset.stackLevel);
        const y = 85 + index * (minimumGap + value * (82 - minimumGap) / 100);
        layer.setAttribute('transform', `translate(0 ${y})`);
      });
    });
    separation.value = `${value}%`;
    range.setAttribute('aria-valuetext', `${value}% separation; schematic only`);
  };
  range.addEventListener('input', updateStack);
  updateStack();
  controls.hidden = false;
}

export function calculateClamp(inputs) {
  const { widthMm, lengthMm, pressurePsi, fasteners, diameterMm, nutFactor } = inputs;
  const limits = { widthMm: [1, 200], lengthMm: [1, 200], pressurePsi: [1, 500], fasteners: [1, 16], diameterMm: [1, 12], nutFactor: [0.05, 0.5] };
  for (const [key, [min, max]] of Object.entries(limits)) {
    const value = inputs[key];
    if (!Number.isFinite(value) || value < min || value > max || (key === 'fasteners' && !Number.isInteger(value))) {
      throw new RangeError(`Enter ${key} within the displayed range.`);
    }
  }
  const areaIn2 = widthMm * lengthMm / (25.4 * 25.4);
  const totalLbf = pressurePsi * areaIn2;
  const perFastenerLbf = totalLbf / fasteners;
  const torqueInLbf = nutFactor * perFastenerLbf * diameterMm / 25.4;
  return { areaIn2, totalLbf, perFastenerLbf, totalN: totalLbf * 4.4482216152605, perFastenerN: perFastenerLbf * 4.4482216152605, torqueInLbf, torqueNm: torqueInLbf * 0.1129848290276167 };
}

const calculator = typeof document === 'undefined' ? null : document.querySelector('[data-clamp-calculator]');
if (calculator) {
  const fields = ['widthMm', 'lengthMm', 'pressurePsi', 'fasteners', 'diameterMm', 'nutFactor'];
  const result = calculator.querySelector('[data-result-values]');
  const error = calculator.querySelector('[data-calc-error]');
  const readInputs = () => Object.fromEntries(fields.map(name => {
    const input = calculator.elements.namedItem(name);
    const value = input.value.trim() === '' ? NaN : Number(input.value);
    return [name, value];
  }));
  const update = () => {
    let valid = true;
    for (const name of fields) {
      const input = calculator.elements.namedItem(name);
      const fieldValid = input.value.trim() !== '' && input.validity.valid;
      input.setAttribute('aria-invalid', String(!fieldValid));
      if (!fieldValid) valid = false;
    }
    if (!valid) {
      result.hidden = true;
      error.hidden = false;
      return;
    }
    try {
      const values = calculateClamp(readInputs());
      for (const [key, digits] of [['torqueInLbf', 2], ['torqueNm', 3], ['areaIn2', 3], ['totalLbf', 1], ['totalN', 0], ['perFastenerLbf', 1], ['perFastenerN', 0]]) {
        calculator.querySelector(`[data-output="${key}"]`).textContent = values[key].toFixed(digits);
      }
      result.hidden = false;
      error.hidden = true;
    } catch {
      result.hidden = true;
      error.hidden = false;
    }
  };
  calculator.addEventListener('input', update);
  calculator.addEventListener('submit', event => event.preventDefault());
  calculator.querySelector('[data-worked-example]').addEventListener('click', () => {
    const example = { widthMm: 40, lengthMm: 40, pressurePsi: 125, fasteners: 2, diameterMm: 3.5052, nutFactor: 0.2 };
    for (const [name, value] of Object.entries(example)) calculator.elements.namedItem(name).value = String(value);
    update();
  });
  calculator.hidden = false;
  update();
}
