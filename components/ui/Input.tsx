import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { THEME } from '../../lib/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={THEME.colors.textMuted}
        style={[
          styles.input,
          {
            borderColor: error ? THEME.colors.danger : THEME.colors.border,
          },
          style,
        ]}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: THEME.spacing.md,
    width: '100%',
  },
  label: {
    color: THEME.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: THEME.spacing.xs,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    color: THEME.colors.text,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    fontSize: 15,
  },
  errorText: {
    color: THEME.colors.danger,
    fontSize: 12,
    marginTop: THEME.spacing.xs,
  },
});
