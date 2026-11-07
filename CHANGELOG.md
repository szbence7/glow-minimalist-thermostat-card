# Changelog

All release notes use British English. Write a “What’s new” section for every GitHub release, and mirror it here.

## 1.4.0

### What’s new

- Weather icons follow the Home Assistant theme colour for each condition, including a purple moon on clear nights.
- The glowing amber divider uses the original artwork.
- The editor asks for the temperature difference at which your thermostat switches on and explains how the card uses it.
- The Eco button can run your own toggle script. Thermostats with Eco and one alternative preset can also toggle Eco directly.

## 1.3.0

### What’s new

- Choose the temperature difference that starts the flame in the visual editor.
- The flame glows and flickers when the target exceeds the room temperature by the configured amount, and goes out when the room reaches the target or heating is switched off.
- The card can show the flame even when a thermostat does not report an active heating state. The setting affects the display only.

## 1.2.0

### What’s new

- See a live preview of the card in the dashboard card picker before adding it.
- The card and its GitHub repository now use the Glow Minimalist Thermostat Card name. Existing dashboard configurations still use `custom:heating-card`.

## 1.1.0

### What’s new

- Heating Card is now called Glow Thermostat Card in the Marketplace and dashboard picker.
- Configure Glow Thermostat Card in the visual editor with searchable lists for your thermostat and weather entity.
- Use separate switches to show or hide the Eco button and weather icon.
- Thermostat controls, the Eco button and the weather icon are enabled when you add a new card through the dashboard picker.

## 1.0.0

### What’s new

- First release of Heating Card for Home Assistant dashboards.
- The large target temperature, room reading and amber divider follow the original Heating design.
- The card follows your dashboard theme and supports optional thermostat controls.
