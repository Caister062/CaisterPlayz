import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your account email.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'nexora://reset-password',
    });

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Email Sent',
        'If an account exists for this email, you will receive password reset instructions shortly.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.description}>
          Enter your registered email address below, and we will send you instructions to reset your password.
        </Text>

        <Input
          label="Email Address"
          placeholder="yourname@domain.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Button
          title="Send Instructions"
          onPress={handleResetPassword}
          loading={loading}
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
  },
  description: {
    color: THEME.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  btn: {
    marginTop: THEME.spacing.sm,
  },
});
