// Brand & token cards. All exported on window.

// --- Brand card -------------------------------------------------------------
function BrandCard() {
  return (
    <div style={{ width: 760, height: 480, background: "#0E2A4E", color: "#fff", padding: 48, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
      {/* corner ticks */}
      <div style={{ position: "absolute", top: 16, left: 16, fontFamily: "JetBrains Mono", fontSize: 10, opacity: 0.5, letterSpacing: "0.2em" }}>◤ NAVIA / SYSTEM v0.1</div>
      <div style={{ position: "absolute", bottom: 16, right: 16, fontFamily: "JetBrains Mono", fontSize: 10, opacity: 0.5, letterSpacing: "0.2em" }}>EL TACTICIAN DE BOLSILLO</div>

      {/* faint compass watermark */}
      <div style={{ position: "absolute", right: -120, top: -120, opacity: 0.07 }}>
        <MiniCompass size={520} heading={285} theme="d" />
      </div>

      <div style={{ position: "relative" }}>
        <div className="label" style={{ color: "#00C2FF", marginBottom: 16 }}>BRAND · WORDMARK</div>
        <Wordmark size={88} color="#FFFFFF" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24, position: "relative" }}>
        <div>
          <div className="label" style={{ color: "#8FA0B6", marginBottom: 8 }}>USO</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: "#D6DEE8" }}>Instrumentación táctica para regata costera. Datos por delante de decoración.</div>
        </div>
        <div>
          <div className="label" style={{ color: "#8FA0B6", marginBottom: 8 }}>POSICIÓN</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: "#D6DEE8" }}>Más cerca de B&G Triton que de una app de fitness. Cabina de avión, no de oficina.</div>
        </div>
        <div>
          <div className="label" style={{ color: "#8FA0B6", marginBottom: 8 }}>VOZ</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: "#D6DEE8" }}>“Header de 8°, considera virar.” Corta, directa, español chileno.</div>
        </div>
      </div>
    </div>
  );
}

// --- Wordmark variants ------------------------------------------------------
function WordmarkVariants() {
  return (
    <div style={{ width: 760, height: 480, background: "#FFFFFF", padding: 40, display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="label" style={{ color: "#475266" }}>WORDMARK · VARIANTES</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E0E6EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wordmark size={56} color="#0E2A4E" />
        </div>
        <div style={{ background: "#0E2A4E", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wordmark size={56} color="#FFFFFF" />
        </div>
        <div style={{ background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wordmark size={56} color="#00C2FF" />
        </div>
        <div style={{ background: "#F6F8FB", border: "1px solid #E0E6EE", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
          <Wordmark size={32} color="#0E2A4E" />
          <Wordmark size={20} color="#0E2A4E" />
          <Wordmark size={14} color="#0E2A4E" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 32, fontSize: 12, color: "#475266" }}>
        <div><span style={{ color: "#8392A6" }}>El glifo</span> ◤ representa la proa apuntando al rumbo.</div>
        <div><span style={{ color: "#8392A6" }}>Tipografía</span> JetBrains Mono 800.</div>
      </div>
    </div>
  );
}

// --- Color tokens -----------------------------------------------------------
function Swatch({ hex, name, light = false }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ background: hex, height: 64, border: light ? "1px solid #E0E6EE" : "none" }} />
      <div style={{ fontSize: 11, fontWeight: 600 }}>{name}</div>
      <div className="num" style={{ fontSize: 10, color: light ? "#8392A6" : "#8FA0B6", textTransform: "uppercase" }}>{hex}</div>
    </div>
  );
}

function PaletteLight() {
  return (
    <div style={{ width: 760, height: 480, background: "#FFFFFF", padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <div className="label" style={{ color: "#8392A6" }}>PALETTE — LIGHT</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>En tierra · planificando</div>
        </div>
        <div style={{ fontSize: 12, color: "#475266", maxWidth: 280, textAlign: "right" }}>Fondo blanco roto, navy de marca, acentos saturados solo para semántica.</div>
      </div>

      <div>
        <div className="label" style={{ color: "#8392A6", marginBottom: 8 }}>NEUTROS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          <Swatch light hex="#EEF2F7" name="canvas" />
          <Swatch light hex="#FFFFFF" name="surface" />
          <Swatch light hex="#F6F8FB" name="surface-2" />
          <Swatch light hex="#E0E6EE" name="border" />
          <Swatch light hex="#475266" name="text-2" />
          <Swatch light hex="#0B1320" name="text" />
        </div>
      </div>

      <div>
        <div className="label" style={{ color: "#8392A6", marginBottom: 8 }}>MARCA & SEMÁNTICA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          <Swatch light hex="#0E2A4E" name="navy (brand)" />
          <Swatch light hex="#0E6BA8" name="info / mar" />
          <Swatch light hex="#15A34A" name="lift" />
          <Swatch light hex="#E03A2C" name="header" />
          <Swatch light hex="#D97706" name="warn" />
          <Swatch light hex="#64748B" name="metadata" />
        </div>
      </div>

      <div>
        <div className="label" style={{ color: "#8392A6", marginBottom: 8 }}>BOYAS (CONSISTENTE EN AMBOS MODOS)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          <Swatch light hex="#D11A2A" name="committee" />
          <Swatch light hex="#F59E0B" name="pin" />
          <Swatch light hex="#16A34A" name="windward" />
          <Swatch light hex="#1E6FE0" name="leeward" />
          <Swatch light hex="#8B5CF6" name="gate" />
        </div>
      </div>
    </div>
  );
}

function PaletteDeck() {
  return (
    <div style={{ width: 760, height: 480, background: "#000000", color: "#fff", padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <div className="label" style={{ color: "#8FA0B6" }}>PALETTE — DECK</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>En cubierta · sol directo</div>
        </div>
        <div style={{ fontSize: 12, color: "#D6DEE8", maxWidth: 280, textAlign: "right" }}>Negro real (no gris). Acentos súper saturados. Texto secundario nunca por debajo de #B9C4D2.</div>
      </div>

      <div>
        <div className="label" style={{ color: "#8FA0B6", marginBottom: 8 }}>NEUTROS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          <Swatch hex="#000000" name="canvas" />
          <Swatch hex="#0A0F18" name="surface" />
          <Swatch hex="#121925" name="surface-2" />
          <Swatch hex="#1E2839" name="border" />
          <Swatch hex="#D6DEE8" name="text-2" />
          <Swatch hex="#FFFFFF" name="text" />
        </div>
      </div>

      <div>
        <div className="label" style={{ color: "#8FA0B6", marginBottom: 8 }}>MARCA & SEMÁNTICA</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
          <Swatch hex="#0E2A4E" name="navy (brand)" />
          <Swatch hex="#00C2FF" name="info / cyan" />
          <Swatch hex="#2EF07A" name="lift" />
          <Swatch hex="#FF5447" name="header" />
          <Swatch hex="#FFB020" name="warn" />
          <Swatch hex="#8FA0B6" name="metadata" />
        </div>
      </div>

      <div>
        <div className="label" style={{ color: "#8FA0B6", marginBottom: 8 }}>BOYAS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          <Swatch hex="#FF3A4A" name="committee" />
          <Swatch hex="#FFB020" name="pin" />
          <Swatch hex="#2EF07A" name="windward" />
          <Swatch hex="#3B95FF" name="leeward" />
          <Swatch hex="#A78BFA" name="gate" />
        </div>
      </div>
    </div>
  );
}

// --- Type scale -------------------------------------------------------------
function TypeScale() {
  const rows = [
    { name: "hero / num heroico",  cls: "num", size: 96, weight: 800,  sample: "06.8",   note: "JetBrains Mono 800 · SOG / Timer en /regata" },
    { name: "metric / num grande", cls: "num", size: 56, weight: 700,  sample: "285°",   note: "JetBrains Mono 700 · COG, TWA, DTL" },
    { name: "metric / num medio",  cls: "num", size: 36, weight: 700,  sample: "14.2",   note: "JetBrains Mono 700 · viento, %polar" },
    { name: "title / display",     cls: "",    size: 28, weight: 700,  sample: "Algarrobo · ILCA 7", note: "Inter 700 · spot, encabezados" },
    { name: "title / section",     cls: "",    size: 17, weight: 600,  sample: "Wind shifts", note: "Inter 600 · títulos de sección" },
    { name: "body / regular",      cls: "",    size: 14, weight: 500,  sample: "Header sostenido 8° hace 12 s — considera virar.", note: "Inter 500" },
    { name: "label / micro caps",  cls: "label", size: 11, weight: 700, sample: "TIME TO BURN", note: "Inter 700 · uppercase 0.14em" },
  ];
  return (
    <div style={{ width: 1120, height: 520, background: "#FFFFFF", padding: 36, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div>
          <div className="label" style={{ color: "#8392A6" }}>TYPE · ESCALA</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>Inter + JetBrains Mono</div>
        </div>
        <div style={{ fontSize: 12, color: "#475266", maxWidth: 380, textAlign: "right" }}>Todos los números van en mono tabular — los dígitos no saltan al cambiar. Pesos 400/500/600/700/800. <b>Nada por debajo de 400.</b></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, flex: 1 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16, alignItems: "center", borderBottom: "1px solid #E0E6EE", paddingBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0B1320" }}>{r.name}</div>
              <div className="num" style={{ fontSize: 10, color: "#8392A6", marginTop: 2 }}>{r.size}px · w{r.weight}</div>
              <div style={{ fontSize: 10, color: "#475266", marginTop: 4, lineHeight: 1.4 }}>{r.note}</div>
            </div>
            <div className={r.cls} style={{ fontSize: r.size, fontWeight: r.weight, color: "#0B1320", lineHeight: 1, ...(r.cls === "num" ? NUM : {}), ...(r.cls === "label" ? { letterSpacing: "0.14em", textTransform: "uppercase" } : {}) }}>
              {r.sample}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Spacing / radii / shadows ---------------------------------------------
function SpacingRadii() {
  const space = [4, 8, 12, 16, 20, 24, 32, 48];
  return (
    <div style={{ width: 760, height: 480, background: "#FFFFFF", padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div className="label" style={{ color: "#8392A6" }}>ESPACIADO · BASE 4 (TAILWIND)</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 16 }}>
          {space.map(s => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: s, height: 64, background: "#0E2A4E" }} />
              <div className="num" style={{ fontSize: 10, fontWeight: 600 }}>{s}</div>
              <div style={{ fontSize: 9, color: "#8392A6" }}>{s/4}</div>
            </div>
          ))}
        </div>
      </div>

      <Hair theme="l" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <div className="label" style={{ color: "#8392A6", marginBottom: 12 }}>RADIOS</div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            {[8, 12, 16, 20, 28].map(r => (
              <div key={r} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: 56, height: 56, background: "#0E2A4E", borderRadius: r }} />
                <div className="num" style={{ fontSize: 10, fontWeight: 600 }}>{r}px</div>
                <div style={{ fontSize: 9, color: "#8392A6" }}>{["chip","card","sheet","modal","pill"][[8,12,16,20,28].indexOf(r)]}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="label" style={{ color: "#8392A6", marginBottom: 12 }}>SOMBRAS</div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ background: "#FFFFFF", borderRadius: 12, width: 90, height: 56, boxShadow: "0 1px 2px rgba(11,19,32,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#8392A6" }}>sm</div>
            <div style={{ background: "#FFFFFF", borderRadius: 12, width: 90, height: 56, boxShadow: "0 4px 12px rgba(11,19,32,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#8392A6" }}>md</div>
            <div style={{ background: "#FFFFFF", borderRadius: 12, width: 90, height: 56, boxShadow: "0 12px 32px rgba(11,19,32,0.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#8392A6" }}>lg</div>
          </div>
          <div style={{ fontSize: 11, color: "#475266", marginTop: 16, lineHeight: 1.5 }}>En <b>deck mode</b> las sombras desaparecen. Reemplazá por borde <span className="num">#1E2839</span> 1px. Las sombras contra negro solo agregan ruido.</div>
        </div>
      </div>

      <div style={{ marginTop: "auto", padding: 12, background: "#F6F8FB", borderLeft: "3px solid #0E2A4E", fontSize: 11, color: "#475266", lineHeight: 1.5 }}>
        <b>Touch targets:</b> mínimo 48×48 px (dedos mojados). Botones críticos (marcar boya, stop tracking, virar): 56–64 px. Spacing inferior siempre &gt; 16 px del borde para zona segura del pulgar.
      </div>
    </div>
  );
}

Object.assign(window, { BrandCard, WordmarkVariants, PaletteLight, PaletteDeck, TypeScale, SpacingRadii });
