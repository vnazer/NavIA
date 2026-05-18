const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// unstable_lazySha1: evitar calcular SHA1 de los 42k archivos en el cold start.
// Sin esto, Metro tarda 20-30 min al arrancar por primera vez (leer+hashear
// todos los node_modules). Con lazy SHA1, solo hashea bajo demanda.
config.watcher = {
  ...config.watcher,
  unstable_lazySha1: true,
};

module.exports = withNativeWind(config, { input: "./global.css" });
