import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme/colors';

interface Props {
  personaje?: string;
  hora?: string;
  titulo?: string;
  bateria?: number;
  mostrarBateria: boolean;
}

export function SceneHeader({ personaje, hora, titulo, bateria, mostrarBateria }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {!!personaje && <Text style={styles.tag}>{personaje}</Text>}
        {!!hora && <Text style={styles.tag}>{hora}</Text>}
        {mostrarBateria && (
          <Text style={[styles.tag, styles.battery]}>
            🔋 {Math.max(bateria ?? 0, 0)} min
          </Text>
        )}
      </View>
      {!!titulo && <Text style={styles.titulo}>{titulo}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    color: colors.textSecondary,
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginRight: 8,
    marginBottom: 6,
  },
  battery: {
    color: colors.neonAmber,
    borderColor: colors.neonAmber,
  },
  titulo: {
    color: colors.neonCyan,
    fontFamily: fonts.mono,
    fontSize: 18,
    letterSpacing: 1,
    marginTop: 4,
  },
});
