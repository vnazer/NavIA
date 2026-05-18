// Wrapper WEB del mapa de spots. Carga el componente real con leaflet
// vía dynamic import + guard de cliente porque Expo Router con
// `output: static` hace render server-side y leaflet rompe sin window.

import { lazy, Suspense, useEffect, useState } from "react";

const MapaSpotsInterno = lazy(() => import("./MapaSpotsInterno.web"));

export function MapaSpots() {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) return null;

  return (
    <Suspense fallback={null}>
      <MapaSpotsInterno />
    </Suspense>
  );
}
