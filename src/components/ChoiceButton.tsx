import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts } from '../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  accent?: boolean;
}

export function ChoiceButton({ label, onPress, accent }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        accent && styles.buttonAccent,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.label, accent && styles.labelAccent]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 10,
  },
  buttonAccent: {
    borderColor: colors.neonCyan,
  },
  buttonPressed: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.neonMagenta,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: fonts.mono,
    lineHeight: 20,
  },
  labelAccent: {
    color: colors.neonCyan,
  },
});
