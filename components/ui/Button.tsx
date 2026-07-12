import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { THEME } from '../../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getStyles = () => {
    let bg = THEME.colors.primary;
    let text = '#050814';
    let border = 'transparent';

    if (variant === 'secondary') {
      bg = THEME.colors.secondary;
      text = '#ffffff';
    } else if (variant === 'outline') {
      bg = 'transparent';
      text = THEME.colors.primary;
      border = THEME.colors.primary;
    } else if (variant === 'danger') {
      bg = THEME.colors.danger;
      text = '#ffffff';
    }

    if (disabled || loading) {
      bg = THEME.colors.surfaceLighter;
      text = THEME.colors.textMuted;
      border = 'transparent';
    }

    return { bg, text, border };
  };

  const { bg, text, border } = getStyles();

  const sizePadding = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'outline' ? 1 : 0,
          paddingVertical: sizePadding,
          paddingHorizontal: sizePadding * 2,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={text} />
      ) : (
        <Text style={[styles.text, { color: text, fontSize }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME.roundness.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
