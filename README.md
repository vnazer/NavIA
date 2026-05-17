# NavIA v2

App de apoyo táctico para regatas de vela en la costa central de Chile.

**Estado:** v2 — rebuild en Expo. Versión anterior (Vite + React DOM) archivada en `navia-legacy`.

## Stack

- Expo SDK 52 + Expo Router v4 (web + iOS + Android)
- TypeScript estricto
- NativeWind v4 (Tailwind para React Native + web)
- Zustand + AsyncStorage (estado y persistencia)
- Open-Meteo (pronóstico de viento, sin API key)

## Desarrollo

```bash
npm install
npx expo start --web
```

## Estructura

- `app/` — Rutas (Expo Router)
- `features/` — Features modulares (wind, spots, …)
- `lib/` — Helpers transversales (Beaufort, conversiones náuticas)

## Roadmap

- [x] Prompt 1 — Bootstrap + pronóstico de viento por spot
- [ ] Prompt 2 — Mapa con OpenSeaMap (Leaflet web / react-native-maps mobile)
- [ ] Prompt 3 — Mareas SHOA
- [ ] Prompt 4 — GPS tracking en regata
- [ ] Prompt 5 — Análisis post-regata
- [ ] Prompt 6 — Bitácora de tripulación
