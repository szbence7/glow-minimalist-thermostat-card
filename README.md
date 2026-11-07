# Glow Minimalist Thermostat Card

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.dev/docs/faq/custom_repositories/)
[![Release](https://img.shields.io/github/v/release/szbence7/glow-minimalist-thermostat-card)](https://github.com/szbence7/glow-minimalist-thermostat-card/releases)
<a href="https://www.buymeacoffee.com/benceix"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="24" alt="Buy Me a Coffee"></a>

Glow Minimalist Thermostat Card is a Home Assistant dashboard card for climate entities. It gives your thermostat an oversized target temperature, a room temperature readout and a slim amber divider. It follows your dashboard’s light or dark theme.

| Dark mode | Light mode |
| --- | --- |
| ![Dark mode preview with a target of 22.0 °C and room temperature of 21.5 °C](images/dark.svg) | ![Light mode preview with a target of 22.0 °C and room temperature of 21.5 °C](images/light.svg) |

## Installation

1. In Home Assistant, open **HACS**. From the three-dot menu, choose **Custom repositories**.
2. Enter `https://github.com/szbence7/glow-minimalist-thermostat-card` and select **Dashboard**.
3. Open **Glow Minimalist Thermostat Card**, choose **Download** and refresh your browser.
4. Edit your dashboard and choose **Add card**. Find the live preview for **Glow Minimalist Thermostat Card** and select it. Select your thermostat and, optionally, a weather entity from the lists. Use the switches to choose which controls and icons to show, then select **Save**.

If you manage dashboard resources in YAML, add the downloaded file as a JavaScript module under your existing resources list.

```yaml
- url: /hacsfiles/glow-minimalist-thermostat-card/heating-card.js
  type: module
```

If you installed the card before the repository rename and manage resources yourself, check the resource URL after updating. Use the path where your installation placed `heating-card.js` and keep a single resource entry for the card.

## Configuration

```yaml
type: custom:heating-card
entity: climate.living_room
weather_entity: weather.home
controls: true
show_eco: true
show_weather: true
flame_threshold: 0.5
```

| Option | Default | Description |
| --- | --- | --- |
| `entity` | Required | A thermostat entity with a single target temperature. |
| `weather_entity` | Optional | A weather entity for the weather icon. The card uses a partly cloudy icon by default. |
| `controls` | On for cards added through the picker | Enables supported controls on the right. For YAML configurations, set `controls: true` to enable them. |
| `show_eco` | `true` | Shows the Eco button. |
| `show_weather` | `true` | Shows the weather icon. |
| `flame_threshold` | `0.5` | Minimum difference between target and room temperature that starts the flame, in your Home Assistant temperature unit. |

In a heating-capable mode, the flame starts when the room is cooler than the target by at least the configured difference. Once lit, it stays on until the room reaches the target, or the thermostat switches away from heating. Set the difference to `0` to start the flame for any positive gap. This setting only changes the card's display. Configure the thermostat itself to change when the heating comes on.

The power button switches between Heat and Off when the thermostat offers both modes. The leaf toggles Eco when the thermostat offers the Eco and None presets. The chevrons use the thermostat’s advertised step and limits. The display uses Home Assistant’s configured temperature unit and locale.

## What’s new

See the [changelog](CHANGELOG.md) and [GitHub releases](https://github.com/szbence7/glow-minimalist-thermostat-card/releases).
