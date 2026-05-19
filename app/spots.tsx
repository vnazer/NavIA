// Pantalla de selección de spot. Lista built-in + custom, permite agregar
// y eliminar spots personalizados.

import { useState } from "react";
import {
  ScrollView,
  Pressable,
  View,
  Text,
  TextInput,
  Modal,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Check, Plus, Trash2, X, MapPin } from "lucide-react-native";
import { SPOTS } from "@/features/spots/data/spots";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { useColorPorTema } from "@/lib/tema/colores";

function confirmar(mensaje: string, onAceptar: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(mensaje)) onAceptar();
  } else {
    Alert.alert("Confirmar", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: onAceptar },
    ]);
  }
}

function parsearCoordenada(s: string): number | null {
  const v = parseFloat(s.replace(",", ".").trim());
  return Number.isFinite(v) ? v : null;
}

export default function PantallaSpots() {
  const router = useRouter();
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);
  const seleccionarSpot = useSpotStore((s) => s.seleccionarSpot);
  const customSpots = useSpotStore((s) => s.customSpots);
  const agregarSpotCustom = useSpotStore((s) => s.agregarSpotCustom);
  const eliminarSpotCustom = useSpotStore((s) => s.eliminarSpotCustom);
  const colorPlus = useColorPorTema("#0e6ba8", "#cffafe");
  const colorMapPin = useColorPorTema("#0a4d7a", "#e2e8f0");
  const colorX = useColorPorTema("#64748b", "#cbd5e1");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [club, setClub] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const seleccionar = (id: string) => {
    seleccionarSpot(id);
    router.back();
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setNombre("");
    setClub("");
    setLat("");
    setLon("");
    setDescripcion("");
    setErrorForm(null);
  };

  const guardar = () => {
    const n = nombre.trim();
    const latNum = parsearCoordenada(lat);
    const lonNum = parsearCoordenada(lon);
    if (!n) {
      setErrorForm("Falta el nombre del spot.");
      return;
    }
    if (latNum === null || latNum < -90 || latNum > 90) {
      setErrorForm("Latitud inválida. Usá decimal (ej: -32.7755).");
      return;
    }
    if (lonNum === null || lonNum < -180 || lonNum > 180) {
      setErrorForm("Longitud inválida. Usá decimal (ej: -71.5295).");
      return;
    }
    const nuevo = agregarSpotCustom({
      nombre: n,
      lat: latNum,
      lon: lonNum,
      club: club.trim() || undefined,
      descripcion: descripcion.trim() || undefined,
    });
    seleccionarSpot(nuevo.id);
    cerrarModal();
    router.back();
  };

  const renderSpot = (
    spot: { id: string; nombre: string; club?: string; descripcion?: string; custom?: boolean },
  ) => {
    const esActual = spot.id === spotIdActual;
    return (
      <Pressable
        key={spot.id}
        onPress={() => seleccionar(spot.id)}
        className={`flex-row items-center justify-between gap-3 rounded-xl p-4 ${
          esActual
            ? "bg-mar-500"
            : "bg-white dark:bg-slate-800"
        }`}
      >
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={`text-base font-semibold ${
                esActual ? "text-white" : "text-slate-900 dark:text-white"
              }`}
            >
              {spot.nombre}
            </Text>
            {spot.custom && (
              <View
                className={`rounded-full px-2 py-0.5 ${
                  esActual ? "bg-white/25" : "bg-mar-100 dark:bg-mar-900"
                }`}
              >
                <Text
                  className={`text-[10px] font-semibold uppercase ${
                    esActual ? "text-white" : "text-mar-700 dark:text-mar-100"
                  }`}
                >
                  Custom
                </Text>
              </View>
            )}
          </View>
          {spot.club && (
            <Text
              className={`text-xs ${
                esActual ? "text-mar-100" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {spot.club}
            </Text>
          )}
          {spot.descripcion && (
            <Text
              className={`mt-1 text-xs ${
                esActual ? "text-mar-100" : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {spot.descripcion}
            </Text>
          )}
        </View>
        <View className="flex-row items-center gap-2">
          {esActual && <Check size={20} color="#fff" />}
          {spot.custom && (
            <Pressable
              hitSlop={10}
              onPress={(e) => {
                e.stopPropagation();
                confirmar(`¿Eliminar el spot "${spot.nombre}"?`, () =>
                  eliminarSpotCustom(spot.id),
                );
              }}
            >
              <Trash2
                size={18}
                color={esActual ? "#fff" : "#dc2626"}
              />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <>
      <ScrollView
        contentContainerClassName="p-4 gap-2"
        className="bg-slate-50 dark:bg-slate-900"
      >
        {SPOTS.map(renderSpot)}

        {customSpots.length > 0 && (
          <Text className="mt-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Mis spots
          </Text>
        )}
        {customSpots.map(renderSpot)}

        <Pressable
          onPress={() => setModalAbierto(true)}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border-2 border-dashed border-mar-500 bg-white p-4 dark:bg-slate-800"
        >
          <Plus size={18} color={colorPlus} />
          <Text className="text-sm font-semibold text-mar-700 dark:text-mar-100">
            Agregar spot custom
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={modalAbierto}
        animationType="slide"
        transparent
        onRequestClose={cerrarModal}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-2xl bg-white p-5 dark:bg-slate-900">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MapPin size={18} color={colorMapPin} />
                <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                  Nuevo spot
                </Text>
              </View>
              <Pressable
                onPress={cerrarModal}
                hitSlop={10}
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
              >
                <X size={22} color={colorX} />
              </Pressable>
            </View>

            <Text className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Nombre *
            </Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Bahía de Algarrobo"
              placeholderTextColor="#94a3b8"
              className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <Text className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Club / Referencia
            </Text>
            <TextInput
              value={club}
              onChangeText={setClub}
              placeholder="Opcional"
              placeholderTextColor="#94a3b8"
              className="mb-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            <View className="mb-3 flex-row gap-2">
              <View className="flex-1">
                <Text className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Latitud *
                </Text>
                <TextInput
                  value={lat}
                  onChangeText={setLat}
                  placeholder="-33.0339"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numbers-and-punctuation"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Longitud *
                </Text>
                <TextInput
                  value={lon}
                  onChangeText={setLon}
                  placeholder="-71.6717"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numbers-and-punctuation"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </View>
            </View>

            <Text className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
              Notas
            </Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Viento dominante, peligros, etc."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={2}
              className="mb-3 min-h-[60px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />

            {errorForm && (
              <Text className="mb-2 text-sm text-red-600">{errorForm}</Text>
            )}

            <Text className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              Tip: en Google Maps tap-derecho sobre el punto → copia las
              coordenadas que aparecen primero.
            </Text>

            <Pressable
              onPress={guardar}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-mar-500 p-3"
            >
              <Check size={18} color="white" />
              <Text className="text-base font-semibold text-white">
                Guardar spot
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
