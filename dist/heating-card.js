const tag = 'heating-card';
const defaultFlameThreshold = 0.5;
const editorLabels = {
  entity: 'Thermostat',
  weather_entity: 'Weather entity',
  controls: 'Enable thermostat controls',
  show_eco: 'Show Eco button',
  show_weather: 'Show weather icon',
  flame_threshold: 'Temperature difference at which your thermostat switches on',
  eco_script: 'Eco toggle script',
};
const weatherIcons = {
  sunny: ['weather-sunny', '#ffc107'],
  'clear-night': ['weather-night', '#9575cd'],
  cloudy: ['weather-cloudy', '#bdbdbd'],
  partlycloudy: ['weather-partly-cloudy', '#78909c'],
  rainy: ['weather-rainy', '#2196f3'],
  pouring: ['weather-pouring', '#3f51b5'],
  snowy: ['weather-snowy', '#c0e0ff'],
  'snowy-rainy': ['weather-snowy-rainy', '#03a9f4'],
  fog: ['weather-fog', '#9e9e9e'],
  hail: ['weather-hail', '#00bcd4'],
  lightning: ['weather-lightning', '#ffeb3b'],
  'lightning-rainy': ['weather-lightning-rainy', '#cddc39'],
  windy: ['weather-windy', '#4caf50'],
  'windy-variant': ['weather-windy-variant', '#4caf50'],
  exceptional: ['alert-circle-outline', '#f44336'],
};
const dividerSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 340'>
  <defs>
    <linearGradient id='o' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#ff8a00' stop-opacity='.1'/>
      <stop offset='.5' stop-color='#ff9a1a'/>
      <stop offset='1' stop-color='#ff8a00' stop-opacity='.1'/>
    </linearGradient>
    <filter id='b'><feGaussianBlur stdDeviation='3'/></filter>
  </defs>
  <rect width='500' height='340' fill='none'/>
  <rect x='396' y='34' width='5' height='272' rx='2.5' fill='url(#o)' filter='url(#b)'/>
  <rect x='397' y='34' width='3' height='272' rx='1.5' fill='url(#o)'/>
</svg>`;

function getEcoPreset(attrs) {
  const presets = attrs.preset_modes ?? [];
  if (!presets.includes('eco')) return undefined;
  const alternatives = presets.filter(preset => preset !== 'eco');
  const exit = alternatives.includes('none') ? 'none' : alternatives.length === 1 ? alternatives[0] : undefined;
  return exit === undefined || attrs.preset_mode === 'eco' ? exit : 'eco';
}

class HeatingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host { display:block; }
        [hidden] { display:none !important; }
        ha-card { container-type:inline-size; overflow:hidden; }
        .panel { position:relative; aspect-ratio:25/17; color:var(--primary-text-color,#20242b); }
        .icon { position:absolute; display:grid; place-items:center; transform:translate(-50%,-50%);
          --mdc-icon-size:6.5cqw; }
        .weather { left:12%; top:15%; --mdc-icon-size:7.5cqw; }
        .flame { left:12%; top:50%; opacity:.25; }
        .flame.active { color:var(--heating-card-accent,#ff8a00); opacity:1;
          filter:drop-shadow(0 0 .8cqw #ff8a00);
          animation:flicker .9s ease-in-out infinite alternate; }
        @keyframes flicker {
          0% { transform:translate(-50%,-50%) scale(1) rotate(-3deg); }
          50% { transform:translate(-50%,-54%) scale(1.16) rotate(2deg); }
          100% { transform:translate(-50%,-50%) scale(.97) rotate(4deg); }
        }
        @media (prefers-reduced-motion:reduce) { .flame.active { animation:none; } }
        .target { position:absolute; top:24%; right:31%; display:flex; gap:2cqw; }
        .whole { font-size:30cqw; line-height:.9; font-weight:200; letter-spacing:-.5cqw; }
        .suffix { display:grid; align-content:start; gap:3cqw; font-size:8cqw; font-weight:300; }
        .room { position:absolute; left:6%; top:84%; transform:translateY(-50%);
          display:flex; align-items:center; gap:2cqw; font-size:5.5cqw;
          --mdc-icon-size:5.5cqw; color:var(--secondary-text-color,#515967); }
        .rail { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
        .controls { position:absolute; inset:3.5% 2.5% 3.5% 80.5%; display:grid;
          grid-auto-rows:1fr; justify-items:center; align-items:center; }
        button { width:100%; height:100%; border:0; padding:0; background:transparent;
          color:inherit; display:grid; place-items:center; --mdc-icon-size:6.5cqw; cursor:pointer; }
        button:disabled { opacity:.35; cursor:default; }
        button:focus-visible { outline:2px solid var(--primary-color,#1976d2); outline-offset:-3px; border-radius:10px; }
        .selected { color:var(--heating-card-accent,#ff8a00); }
        [data-control="eco"].selected { color:var(--success-color,#2e7d32); }
      </style>
      <ha-card><div class="panel" role="group" aria-label="Heating">
        <ha-icon class="icon weather" aria-hidden="true"></ha-icon>
        <ha-icon class="icon flame" icon="mdi:fire" aria-hidden="true"></ha-icon>
        <div class="target"><span class="whole" aria-hidden="true"></span>
          <span class="suffix" aria-hidden="true"><span class="unit"></span><span class="fraction"></span></span>
        </div>
        <div class="room"><ha-icon icon="mdi:home-thermometer-outline" aria-hidden="true"></ha-icon>
          <span class="room-value"></span>
        </div>
        <img class="rail" alt="" src="data:image/svg+xml,${encodeURIComponent(dividerSvg)}">
        <div class="controls">
          <button type="button" data-control="power" aria-label="Toggle heating"><ha-icon icon="mdi:power"></ha-icon></button>
          <button type="button" data-control="eco" aria-label="Toggle economy preset"><ha-icon icon="mdi:leaf"></ha-icon></button>
          <button type="button" data-control="up" aria-label="Raise target temperature"><ha-icon icon="mdi:chevron-double-up"></ha-icon></button>
          <button type="button" data-control="down" aria-label="Lower target temperature"><ha-icon icon="mdi:chevron-double-down"></ha-icon></button>
        </div>
      </div></ha-card>`;
    this.shadowRoot.querySelector('.controls').addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button && !button.disabled) this.runControl(button.dataset.control);
    });
  }

  static getStubConfig(hass) {
    const entities = Object.keys(hass?.states ?? {});
    const entity = entities.find(id => id.startsWith('climate.')) ?? 'climate.thermostat';
    const weather_entity = entities.find(id => id.startsWith('weather.'));
    const config = { entity, controls: true, show_eco: true, show_weather: true };
    return weather_entity ? { ...config, weather_entity } : config;
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { domain: 'climate' } } },
        { name: 'weather_entity', selector: { entity: { domain: 'weather' } } },
        { name: 'controls', default: false, selector: { boolean: {} } },
        { name: 'show_eco', default: true, selector: { boolean: {} } },
        { name: 'eco_script', selector: { entity: { domain: 'script' } } },
        { name: 'show_weather', default: true, selector: { boolean: {} } },
        { name: 'flame_threshold', default: defaultFlameThreshold,
          selector: { number: { min: 0, step: 0.1, mode: 'box' } } },
      ],
      computeLabel: field => editorLabels[field.name],
      computeHelper: field => ({
        flame_threshold: 'Enter the difference used by your thermostat, in your Home Assistant temperature unit. This card uses it for the display only.',
        eco_script: 'Optional. Runs your own Eco toggle script when you press the Eco button.',
      })[field.name],
    };
  }

  setConfig(config) {
    if (typeof config?.entity !== 'string' || !/^climate\.[a-z0-9_]+$/.test(config.entity)) {
      throw new Error('Choose a climate entity for Glow Minimalist Thermostat Card.');
    }
    const threshold = config.flame_threshold ?? defaultFlameThreshold;
    if (!Number.isFinite(threshold) || threshold < 0) {
      throw new Error('The flame start temperature difference must be zero or greater.');
    }
    if (this.config?.entity !== config.entity || this.flameThreshold !== threshold) {
      this.flameActive = false;
    }
    this.flameThreshold = threshold;
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this.homeAssistant = hass;
    this.render();
  }

  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, rows: 'auto', min_columns: 6 }; }

  render() {
    if (!this.config || !this.homeAssistant) return;
    const hass = this.homeAssistant;
    const climate = hass.states[this.config.entity];
    const weather = hass.states[this.config.weather_entity];
    const attrs = climate?.attributes ?? {};
    const unit = hass.config?.unit_system?.temperature ?? '°C';
    const locale = hass.locale?.language ?? hass.language ?? 'en-GB';
    const formatter = new Intl.NumberFormat(locale, { minimumFractionDigits: 1,
      maximumFractionDigits: 2, useGrouping: false });
    const root = this.shadowRoot;
    const target = Number.isFinite(attrs.temperature) ? attrs.temperature : null;
    const parts = target === null ? [] : formatter.formatToParts(target);
    const integer = parts.findIndex(part => part.type === 'decimal');
    root.querySelector('.whole').textContent = integer < 0 ? '–' : parts.slice(0, integer).map(p => p.value).join('');
    root.querySelector('.fraction').textContent = integer < 0 ? '' : parts.slice(integer).map(p => p.value).join('');
    root.querySelector('.unit').textContent = unit;
    root.querySelector('.target').setAttribute('aria-label',
      target === null ? 'Target temperature unavailable' : `Target temperature ${formatter.format(target)} ${unit}`);
    const room = root.querySelector('.room-value');
    const current = attrs.current_temperature;
    room.textContent = Number.isFinite(current) ? `${formatter.format(current)} ${unit}` : '–';
    room.setAttribute('aria-label', `Room temperature ${room.textContent}`);
    const weatherIcon = root.querySelector('.weather');
    weatherIcon.hidden = this.config.show_weather === false;
    if (!weatherIcon.hidden) {
      const condition = weather?.state === 'clear' ? 'sunny' : weather?.state;
      const state = Object.hasOwn(weatherIcons, condition) ? condition : 'partlycloudy';
      const [icon, fallback] = weatherIcons[state];
      weatherIcon.setAttribute('icon', weather?.attributes?.icon ?? `mdi:${icon}`);
      weatherIcon.style.color = `var(--state-weather-${state.replaceAll('-', '_')}-color, ${fallback})`;
    }
    const heatingMode = ['heat', 'auto', 'heat_cool'].includes(climate?.state) && attrs.hvac_action !== 'cooling';
    const gap = target !== null && Number.isFinite(current)
      ? Math.round((target - current) * 1e6) / 1e6
      : 0;
    this.flameActive = heatingMode && gap > 0 && (this.flameActive || gap >= this.flameThreshold);
    root.querySelector('.flame').classList.toggle('active', this.flameActive);

    const available = this.config.controls === true && climate && !['unavailable', 'unknown'].includes(climate.state);
    const modes = attrs.hvac_modes ?? [];
    const step = attrs.target_temp_step;
    const adjustable = available && target !== null && Number.isFinite(step) && step > 0 &&
      Number.isFinite(attrs.min_temp) && Number.isFinite(attrs.max_temp);
    const power = root.querySelector('[data-control="power"]');
    power.disabled = !available || !modes.includes('off') || !modes.includes('heat') || !['off','heat'].includes(climate.state);
    power.classList.toggle('selected', climate?.state === 'heat');
    power.setAttribute('aria-pressed', String(climate?.state === 'heat'));
    const eco = root.querySelector('[data-control="eco"]');
    eco.hidden = this.config.show_eco === false;
    const script = hass.states[this.config.eco_script];
    const ecoAvailable = this.config.eco_script
      ? script && !['unavailable', 'unknown'].includes(script.state)
      : getEcoPreset(attrs) !== undefined;
    eco.disabled = eco.hidden || !available || !ecoAvailable;
    eco.classList.toggle('selected', attrs.preset_mode === 'eco');
    eco.setAttribute('aria-pressed', String(attrs.preset_mode === 'eco'));
    root.querySelector('[data-control="up"]').disabled = !adjustable || target >= attrs.max_temp;
    root.querySelector('[data-control="down"]').disabled = !adjustable || target <= attrs.min_temp;
    root.querySelector('.controls').inert = this.config.controls !== true;
  }

  runControl(control) {
    const hass = this.homeAssistant;
    let entity_id = this.config.entity;
    const climate = hass.states[entity_id];
    const attrs = climate.attributes;
    let domain = 'climate';
    let service;
    let value;
    if (control === 'power') {
      service = 'set_hvac_mode';
      value = { hvac_mode: climate.state === 'off' ? 'heat' : 'off' };
    } else if (control === 'eco') {
      if (this.config.eco_script) {
        domain = 'script';
        service = 'turn_on';
        entity_id = this.config.eco_script;
        value = {};
      } else {
        service = 'set_preset_mode';
        value = { preset_mode: getEcoPreset(attrs) };
      }
    } else {
      service = 'set_temperature';
      const next = attrs.temperature + (control === 'up' ? 1 : -1) * attrs.target_temp_step;
      value = { temperature: Number(Math.min(attrs.max_temp, Math.max(attrs.min_temp, next)).toFixed(6)) };
    }
    Promise.resolve(hass.callService(domain, service, { entity_id, ...value })).catch(error => {
      this.dispatchEvent(new CustomEvent('hass-notification', {
        bubbles: true, composed: true, detail: { message: error.message },
      }));
    });
  }
}

if (!customElements.get(tag)) {
  customElements.define(tag, HeatingCard);
  window.customCards = window.customCards ?? [];
  window.customCards.push({
    type: tag,
    name: 'Glow Minimalist Thermostat Card',
    preview: true,
    description: 'A thermostat display with oversized temperatures and an amber accent.',
  });
}
