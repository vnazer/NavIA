// Wire everything together into the design canvas.

const { DesignCanvas, DCSection, DCArtboard } = window;

function App() {
  return (
    <DesignCanvas title="NavIA · Sistema de diseño v0.1" subtitle="Instrumentación táctica para regata · Light & Deck mode">

      {/* ============================================================ */}
      <DCSection id="brand" title="01 · Marca & Tokens">
        <DCArtboard id="brand-card" label="Brand" width={760} height={480}>
          <BrandCard />
        </DCArtboard>
        <DCArtboard id="wordmark" label="Wordmark · variantes" width={760} height={480}>
          <WordmarkVariants />
        </DCArtboard>
        <DCArtboard id="palette-light" label="Palette · Light" width={760} height={480}>
          <PaletteLight />
        </DCArtboard>
        <DCArtboard id="palette-deck" label="Palette · Deck" width={760} height={480}>
          <PaletteDeck />
        </DCArtboard>
        <DCArtboard id="type" label="Type scale" width={1120} height={520}>
          <TypeScale />
        </DCArtboard>
        <DCArtboard id="spacing" label="Spacing · Radii · Shadows" width={760} height={480}>
          <SpacingRadii />
        </DCArtboard>
      </DCSection>

      {/* ============================================================ */}
      <DCSection id="components" title="02 · Componentes">
        <DCArtboard id="cmp-light" label="Light mode" width={1120} height={1280}>
          <ComponentsBoard theme="l" />
        </DCArtboard>
        <DCArtboard id="cmp-deck" label="Deck mode" width={1120} height={1280}>
          <ComponentsBoard theme="d" />
        </DCArtboard>
      </DCSection>

      {/* ============================================================ */}
      <DCSection id="race" title="03 · Pantalla 1 — Regata en vivo (la más importante)">
        <DCArtboard id="race-l" label="Light · en tierra" width={393} height={852}>
          <Phone theme="l"><ScreenRaceLive theme="l" /></Phone>
        </DCArtboard>
        <DCArtboard id="race-d" label="Deck · en cubierta" width={393} height={852}>
          <Phone theme="d"><ScreenRaceLive theme="d" /></Phone>
        </DCArtboard>
      </DCSection>

      <DCSection id="prestart" title="04 · Pantalla 2 — Prestart · Táctica">
        <DCArtboard id="prestart-l" label="Light" width={393} height={852}>
          <Phone theme="l"><ScreenPrestart theme="l" /></Phone>
        </DCArtboard>
        <DCArtboard id="prestart-d" label="Deck" width={393} height={852}>
          <Phone theme="d"><ScreenPrestart theme="d" /></Phone>
        </DCArtboard>
      </DCSection>

      <DCSection id="map" title="05 · Pantalla 3 — Mapa con UI flotante">
        <DCArtboard id="map-l" label="Light" width={393} height={852}>
          <Phone theme="l"><ScreenMap theme="l" /></Phone>
        </DCArtboard>
        <DCArtboard id="map-d" label="Deck" width={393} height={852}>
          <Phone theme="d"><ScreenMap theme="d" /></Phone>
        </DCArtboard>
      </DCSection>

      <DCSection id="home" title="06 · Pantalla 4 — Home · Dashboard">
        <DCArtboard id="home-l" label="Light" width={393} height={852}>
          <Phone theme="l"><ScreenHome theme="l" /></Phone>
        </DCArtboard>
        <DCArtboard id="home-d" label="Deck" width={393} height={852}>
          <Phone theme="d"><ScreenHome theme="d" /></Phone>
        </DCArtboard>
      </DCSection>

      <DCSection id="bitacora" title="07 · Pantalla 5 — Bitácora">
        <DCArtboard id="bita-l" label="Light" width={393} height={852}>
          <Phone theme="l"><ScreenBitacora theme="l" /></Phone>
        </DCArtboard>
        <DCArtboard id="bita-d" label="Deck" width={393} height={852}>
          <Phone theme="d"><ScreenBitacora theme="d" /></Phone>
        </DCArtboard>
      </DCSection>

      {/* ============================================================ */}
      <DCSection id="states" title="08 · Estados especiales">
        <DCArtboard id="ocs-d" label="OCS · alerta crítica" width={393} height={852}>
          <Phone theme="d"><StateOCS theme="d" /></Phone>
        </DCArtboard>
        <DCArtboard id="nogps-l" label="Sin GPS" width={393} height={852}>
          <Phone theme="l"><StateNoGPS theme="l" /></Phone>
        </DCArtboard>
        <DCArtboard id="t10-d" label="Últimos 10 segundos" width={393} height={852}>
          <Phone theme="d"><StateFinalCountdown theme="d" /></Phone>
        </DCArtboard>
        <DCArtboard id="voice-d" label="Voice cue activo" width={393} height={852}>
          <Phone theme="d"><StateVoiceCue theme="d" /></Phone>
        </DCArtboard>
      </DCSection>

      {/* ============================================================ */}
      <DCSection id="notes" title="09 · Implementación">
        <DCArtboard id="notes" label="Tailwind config + fuentes + tema" width={1120} height={800}>
          <ImplementationNotes />
        </DCArtboard>
      </DCSection>

    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
