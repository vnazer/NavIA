// Wrapper SSR-safe del mini-mapa de regata.

import { lazy, Suspense, useEffect, useState } from "react";
import { View } from "react-native";
import type { Boya } from "../types";

const MapaRegataInterno = lazy(() => import("./MapaRegataInterno.web"));

type Props = {
  posBarco: { lat: number; lon: number; cog?: number } | null;
  boyas: Boya[];
  fallback: { lat: number; lon: number };
};

export function MapaRegata(props: Props) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) {
    return (
      <View
        className="rounded-xl bg-slate-100"
        style={{ height: 300 }}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <View
          className="rounded-xl bg-slate-100"
          style={{ height: 300 }}
        />
      }
    >
      <MapaRegataInterno {...props} />
    </Suspense>
  );
}
