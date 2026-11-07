# Instalar NavIA en tu iPhone y Apple Watch (uso personal, sin App Store)

La app se instala directo desde el Mac, por cable, firmada con tu Apple ID.
La versión que se instala es **Release**: lleva todo el código dentro y no
necesita el Mac ni Metro para funcionar.

## Una sola vez

1. **Apple ID en Xcode:** Xcode → Ajustes (⌘,) → Cuentas → `+` → Apple ID.
   - Con cuenta gratuita la app dura **7 días**; luego se vuelve a instalar
     igual (un comando). Con el Apple Developer Program (US$99/año) dura 1 año
     y se puede usar TestFlight.
2. **Modo desarrollador en el iPhone:** conecta el iPhone por cable, acepta
   "Confiar en este ordenador", y luego Ajustes → Privacidad y seguridad →
   Modo de desarrollador → activar (el iPhone se reinicia).
3. **Modo desarrollador en el Watch:** en el reloj, Ajustes → Privacidad y
   seguridad → Modo de desarrollador → activar. El reloj debe estar
   enlazado al iPhone, desbloqueado y cerca.
4. La primera vez que abras la app: Ajustes → General → VPN y gestión de
   dispositivos → tu Apple ID → Confiar.

## Instalar / reinstalar

Desde la carpeta del proyecto, con el iPhone conectado y desbloqueado:

```bash
npm run ios:dispositivo
```

O desde Xcode: abrir `ios/NavIA.xcworkspace`, elegir el esquema **NavIA** y
tu iPhone arriba, y ▶︎ Run. La app del reloj viaja dentro de la del iPhone y
se instala sola en el Watch (puede tardar unos minutos; también se puede
forzar desde la app Watch del iPhone → NavIA → Instalar).

## Probar sin teléfono (simulador)

```bash
npm run ios:simulador
```

## Qué hace el reloj

Desliza entre pantallas:

| Pantalla | Para qué |
|---|---|
| **Salida** | Cuenta atrás (corona = minutos), **SYNC** al minuto más cercano con la señal de la comisión, `−1'`, vibraciones en cada minuto, 30/20/15 s y últimos 10 s, doble vibración en la salida; luego cuenta el tiempo de regata. |
| **Velocidad** | SOG grande, rumbo, VMG y velocidad máxima. |
| **Borneo** | En ceñida: rolada favorable (verde) o en contra (rojo) respecto del viento de referencia. Vibra ▲ al pasar el umbral favorable y ▼▼ si la rolada en contra se sostiene 6 s (momento de virar). "Poner en 0" toma el viento actual como nueva referencia. |
| **Viento** | Viento de referencia: se carga solo del pronóstico al tener GPS; ajuste fino con la corona; "Desde viradas" usa la bisectriz de tus dos últimos bordos de ceñida (lo más preciso en el agua). Umbral de aviso configurable. |
| **Sesión** | Sesión de entrenamiento de vela: mantiene la app activa con la muñeca abajo (sin esto watchOS la pausa), muestra pulso, viradas y trasluchadas, y guarda la ruta en Fitness. Se inicia sola al empezar la cuenta atrás. |

## Si algo falla

- **"Untrusted developer"**: paso 4.
- **Error de firma con HealthKit en cuenta gratuita**: avisar; se puede quitar
  la capacidad de Salud del reloj (la app sigue funcionando, solo pierde pulso
  y el guardado en Fitness).
- **La app se cierra al abrir**: revisar que se esté instalando la versión de
  esta rama (`fix/ios27-reloj` o posterior); iOS 27 exige el ciclo de vida por
  escenas que se agregó aquí.
