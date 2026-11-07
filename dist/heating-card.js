const tag = 'heating-card';
const weatherIcons = {
  sunny: 'weather-sunny', clear: 'weather-sunny', 'clear-night': 'weather-night',
  cloudy: 'weather-cloudy', partlycloudy: 'weather-partly-cloudy',
  rainy: 'weather-rainy', pouring: 'weather-pouring', snowy: 'weather-snowy',
  'snowy-rainy': 'weather-snowy-rainy', fog: 'weather-fog', hail: 'weather-hail',
  lightning: 'weather-lightning', 'lightning-rainy': 'weather-lightning-rainy',
  windy: 'weather-windy', 'windy-variant': 'weather-windy-variant',
  exceptional: 'alert-circle-outline',
};

class HeatingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        :host { display:block; }
        ha-card { container-type:inline-size; overflow:hidden; }
        .panel { position:relative; aspect-ratio:25/17; color:var(--primary-text-color,#20242b); }
        .icon { position:absolute; display:grid; place-items:center; transform:translate(-50%,-50%);
          --mdc-icon-size:6.5cqw; }
        .weather { left:12%; top:15%; color:var(--state-weather-sunny-color,#dfa43b); }
        .flame { left:12%; top:50%; opacity:.25; }
        .flame.active { color:var(--heating-card-accent,#ff8a00); opacity:1;
          animation:flicker 1.2s ease-in-out infinite alternate; }
        @keyframes flicker { to { transform:translate(-50%,-54%) rotate(4deg) scale(1.1); } }
        @media (prefers-reduced-motion:reduce) { .flame.active { animation:none; } }
        .target { position:absolute; top:24%; right:31%; display:flex; gap:2cqw; }
        .whole { font-size:30cqw; line-height:.9; font-weight:200; letter-spacing:-.5cqw; }
        .suffix { display:grid; align-content:start; gap:3cqw; font-size:8cqw; font-weight:300; }
        .room { position:absolute; left:6%; top:84%; transform:translateY(-50%);
          display:flex; align-items:center; gap:2cqw; font-size:5.5cqw;
          --mdc-icon-size:5.5cqw; color:var(--secondary-text-color,#515967); }
        .rail { position:absolute; left:79.5%; top:10%; bottom:10%; width:.65cqw; border-radius:99px;
          background:linear-gradient(transparent,var(--heating-card-accent,#ff8a00),transparent); }
        .rail::before { content:''; position:absolute; inset:0 -1px; border-radius:inherit;
          background:inherit; filter:blur(3px); }
        .controls { position:absolute; inset:3.5% 2.5% 3.5% 80.5%; display:grid;
          grid-template-rows:repeat(4,1fr); justify-items:center; align-items:center; }
        button { width:100%; height:100%; border:0; padding:0; background:transparent;
          color:inherit; display:grid; place-items:center; --mdc-icon-size:6.5cqw; cursor:pointer; }
        button:disabled { opacity:.35; cursor:default; }
        button:focus-visible { outline:2px solid var(--primary-color,#1976d2); outline-offset:-3px; border-radius:10px; }
        .selected { color:var(--heating-card-accent,#ff8a00); }
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
        <div class="rail" aria-hidden="true"></div>
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
    return weather_entity ? { entity, weather_entity } : { entity };
  }

  setConfig(config) {
    if (typeof config?.entity !== 'string' || !/^climate\.[a-z0-9_]+$/.test(config.entity)) {
      throw new Error('Choose a climate entity for Heating Card.');
    }
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
    room.textContent = Number.isFinite(attrs.current_temperature) ? `${formatter.format(attrs.current_temperature)} ${unit}` : '–';
    room.setAttribute('aria-label', `Room temperature ${room.textContent}`);
    root.querySelector('.weather').setAttribute('icon', `mdi:${weatherIcons[weather?.state] ?? 'weather-partly-cloudy'}`);
    root.querySelector('.flame').classList.toggle('active', attrs.hvac_action === 'heating');

    const available = this.config.controls === true && climate && !['unavailable', 'unknown'].includes(climate.state);
    const modes = attrs.hvac_modes ?? [];
    const presets = attrs.preset_modes ?? [];
    const step = attrs.target_temp_step;
    const adjustable = available && target !== null && Number.isFinite(step) && step > 0 &&
      Number.isFinite(attrs.min_temp) && Number.isFinite(attrs.max_temp);
    const power = root.querySelector('[data-control="power"]');
    power.disabled = !available || !modes.includes('off') || !modes.includes('heat') || !['off','heat'].includes(climate.state);
    power.classList.toggle('selected', climate?.state === 'heat');
    power.setAttribute('aria-pressed', String(climate?.state === 'heat'));
    const eco = root.querySelector('[data-control="eco"]');
    eco.disabled = !available || !presets.includes('eco') || !presets.includes('none');
    eco.classList.toggle('selected', attrs.preset_mode === 'eco');
    eco.setAttribute('aria-pressed', String(attrs.preset_mode === 'eco'));
    root.querySelector('[data-control="up"]').disabled = !adjustable || target >= attrs.max_temp;
    root.querySelector('[data-control="down"]').disabled = !adjustable || target <= attrs.min_temp;
    root.querySelector('.controls').inert = this.config.controls !== true;
  }

  runControl(control) {
    const hass = this.homeAssistant;
    const entity_id = this.config.entity;
    const climate = hass.states[entity_id];
    const attrs = climate.attributes;
    let service;
    let value;
    if (control === 'power') {
      service = 'set_hvac_mode';
      value = { hvac_mode: climate.state === 'off' ? 'heat' : 'off' };
    } else if (control === 'eco') {
      service = 'set_preset_mode';
      value = { preset_mode: attrs.preset_mode === 'eco' ? 'none' : 'eco' };
    } else {
      service = 'set_temperature';
      const next = attrs.temperature + (control === 'up' ? 1 : -1) * attrs.target_temp_step;
      value = { temperature: Number(Math.min(attrs.max_temp, Math.max(attrs.min_temp, next)).toFixed(6)) };
    }
    Promise.resolve(hass.callService('climate', service, { entity_id, ...value })).catch(error => {
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
    name: 'Heating Card',
    description: 'A thermostat display with oversized temperatures and an amber accent.',
  });
}
