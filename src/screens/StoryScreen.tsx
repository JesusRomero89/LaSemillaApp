import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { storyData } from '../data/story';
import {
  choose,
  createInitialState,
  GameState,
  Persistentes,
  visibleOptions,
} from '../engine/storyEngine';
import { cargarPersistentes, guardarPersistentes } from '../engine/persistencia';
import { aplicarTokens, nombreReplicante } from '../engine/tokens';
import { ChoiceButton } from '../components/ChoiceButton';
import { SceneHeader } from '../components/SceneHeader';
import { colors, fonts } from '../theme/colors';

function personajeActivo(state: GameState): string | undefined {
  const ruta = state.vars.ruta as string;
  if (ruta === 'mora') return storyData.personajes.mora.nombre;
  if (ruta === 'replicante') return nombreReplicante(storyData, state.vars);
  return undefined;
}

export function StoryScreen() {
  const [persistentes, setPersistentes] = useState<Persistentes | null>(null);
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    let vivo = true;
    cargarPersistentes(storyData).then((cargadas) => {
      if (!vivo) return;
      setPersistentes(cargadas);
      setState(createInitialState(storyData, cargadas));
    });
    return () => {
      vivo = false;
    };
  }, []);

  // Las marcas persistentes se escriben al llegar a un final: es el único
  // momento en el que cambian.
  useEffect(() => {
    if (!state?.ending) return;
    setPersistentes(state.persistentes);
    guardarPersistentes(state.persistentes);
  }, [state?.ending, state?.persistentes]);

  const opciones = useMemo(() => (state ? visibleOptions(storyData, state) : []), [state]);

  if (!state) {
    return (
      <SafeAreaView style={[styles.safe, styles.centrado]}>
        <StatusBar style="light" />
        <ActivityIndicator color={colors.neonCyan} />
      </SafeAreaView>
    );
  }

  const node = storyData.nodos[state.currentNodeId];
  const personaje = personajeActivo(state);
  const mostrarBateria = state.vars.ruta === 'replicante' && !state.ending && (state.vars.bateria as number) < 170;

  const handleChoose = (index: number) => {
    const opcion = opciones[index];
    setState((prev) => (prev ? choose(storyData, prev, opcion) : prev));
  };

  const handleRestart = () => setState(createInitialState(storyData, persistentes ?? state.persistentes));

  const texto = aplicarTokens(state.displayText, storyData, state.vars);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brand}>{storyData.meta.titulo.toUpperCase()}</Text>

        {state.ending ? (
          <View>
            <SceneHeader personaje={personaje} hora={node.hora} mostrarBateria={false} />
            {/* La escena que desemboca en el final se sigue contando: el
                nodo de convergencia trae su propio texto y sus ramas. */}
            {!!texto && <Text style={styles.texto}>{texto}</Text>}
            <Text style={styles.endingTitulo}>{state.ending.titulo}</Text>
            <Text style={styles.texto}>{aplicarTokens(state.ending.texto, storyData, state.vars)}</Text>
            <View style={styles.choices}>
              <ChoiceButton label="Volver a jugar" onPress={handleRestart} accent />
            </View>
          </View>
        ) : (
          <View>
            <SceneHeader
              personaje={personaje}
              hora={node.hora}
              titulo={node.titulo}
              bateria={state.vars.bateria as number}
              mostrarBateria={mostrarBateria}
            />
            <Text style={styles.texto}>{texto}</Text>
            <View style={styles.choices}>
              {opciones.map((opcion, index) => (
                <ChoiceButton
                  key={`${state.currentNodeId}-${index}`}
                  label={opcion.texto}
                  onPress={() => handleChoose(index)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centrado: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  brand: {
    color: colors.neonMagenta,
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 4,
    marginBottom: 20,
  },
  texto: {
    color: colors.textPrimary,
    fontFamily: fonts.mono,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  endingTitulo: {
    color: colors.neonAmber,
    fontFamily: fonts.mono,
    fontSize: 22,
    letterSpacing: 1,
    marginBottom: 12,
  },
  choices: {
    marginTop: 4,
  },
});
