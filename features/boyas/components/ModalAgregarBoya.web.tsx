// Modal HTML para agregar una boya nueva al mapa. Web-only (usa overlays
// HTML nativos en vez de React Native components para integrarse bien con
// react-leaflet, que ya vive en el DOM).

import { useState } from "react";
import { BOYA_META, type TipoBoya } from "../types";

type Props = {
  lat: number;
  lon: number;
  onConfirmar: (tipo: TipoBoya, label?: string) => void;
  onCancelar: () => void;
};

const TIPOS_ORDENADOS: TipoBoya[] = [
  "committee",
  "pin",
  "windward",
  "leeward",
  "gate_l",
  "gate_r",
  "custom",
];

export function ModalAgregarBoya({
  lat,
  lon,
  onConfirmar,
  onCancelar,
}: Props) {
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState<TipoBoya>("windward");
  const [label, setLabel] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onCancelar}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: 20,
          borderRadius: 12,
          width: "min(420px, 90vw)",
          maxHeight: "90vh",
          overflow: "auto",
          fontFamily: "system-ui, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 600 }}>
          Agregar boya
        </h2>
        <p style={{ color: "#64748b", fontSize: 12, margin: "4px 0 16px" }}>
          {lat.toFixed(5)}, {lon.toFixed(5)}
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
            Tipo
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 6,
              marginTop: 8,
            }}
          >
            {TIPOS_ORDENADOS.map((t) => {
              const meta = BOYA_META[t];
              const activo = t === tipoSeleccionado;
              return (
                <button
                  key={t}
                  onClick={() => setTipoSeleccionado(t)}
                  style={{
                    padding: "10px 12px",
                    border: activo
                      ? `2px solid ${meta.color}`
                      : "1px solid #e2e8f0",
                    borderRadius: 8,
                    background: activo ? `${meta.color}15` : "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: activo ? 600 : 400,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                  <span>{meta.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
            Label (opcional)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ej: W1, Lay K3"
            maxLength={10}
            style={{
              width: "100%",
              padding: 8,
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              marginTop: 6,
              fontSize: 14,
              boxSizing: "border-box",
            }}
            autoFocus
          />
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onCancelar}
            style={{
              padding: "10px 16px",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              background: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() =>
              onConfirmar(tipoSeleccionado, label.trim() || undefined)
            }
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 6,
              background: "#0a4d7a",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
