import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { storyData } from '../data/story';
import { choose, createInitialState, GameState, visibleOptions } from '../engine/storyEngine';
import { ChoiceButton } from '../components/ChoiceButton';
import { SceneHeader } from '../components/SceneHeader';
import { colors, fonts } from '../theme/colors';

function personajeActivo(state: GameState): string | undefined {
  const ruta = state.vars.ruta as string;
  if (ruta === 'mora') return storyData.personajes.mora.nombre;
  if (ruta === 'replicante') {
    const genero = state.vars.genero as string;
    const p = storyData.personajes.replicante;
    return genero === 'f' ? p.nombre_f : p.nombre_m;
  }
  return undefined;
}

export function StoryScreen() {
  const [state, setState] = useState<GameState>(() => createInitialState(storyData));

  const node = storyData.nodos[state.currentNodeId];
  const opciones = useMemo(() => visibleOptions(storyData, state), [state]);
  const personaje = personajeActivo(state);
  const mostrarBateria = state.vars.ruta === 'replicante' && !state.ending;

  const handleChoose = (opcionIndex: number) => {
    const opcion = opciones[opcionIndex];
    setState((prev) => choose(storyData, prev, opcion));
  };

  const handleRestart = () => setState(createInitialState(storyData));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.brand}>{storyData.meta.titulo.toUpperCase()}</Text>

        {state.ending ? (
          <View>
            <SceneHeader personaje={personaje} mostrarBateria={false} />
            <Text style={styles.endingTitulo}>{state.ending.titulo}</Text>
            <Text style={styles.texto}>{state.ending.texto}</Text>
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
            <Text style={styles.texto}>{state.displayText}</Text>
            <View style={styles.choices}>
              {opciones.map((opcion, index) => (
                <ChoiceButton key={`${state.currentNodeId}-${index}`} label={opcion.texto} onPress={() => handleChoose(index)} />
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
