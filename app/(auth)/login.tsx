import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShieldCheck, HelpCircle } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleAppleSignInMock = () => {
    setAppleLoading(true);
    // Simulate Apple authentication process
    setTimeout(async () => {
      setAppleLoading(false);
      // For review / mockup mode, we trigger a standard notification or signin mock
      Alert.alert(
        'Apple Sign In',
        'Sign in with Apple credentials verification requested. Ready for production credentials integration.'
      );
    }, 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.appName}>NEXORA</Text>
        <Text style={styles.tagline}>Your gaming journey lives here.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.title}>Welcome Back</Text>
        
        <Input
          label="Email Address"
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={styles.forgotBtn}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.actionBtn}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <Button
          title="Sign in with Apple"
          variant="outline"
          onPress={handleAppleSignInMock}
          loading={appleLoading}
          style={styles.appleBtn}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to NEXORA? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    padding: THEME.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 240, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.xs,
    fontStyle: 'italic',
  },
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: THEME.spacing.md,
  },
  forgotText: {
    color: THEME.colors.primary,
    fontSize: 13,
  },
  actionBtn: {
    marginTop: THEME.spacing.sm,
    shadowColor: '#00f0ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: THEME.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  dividerText: {
    color: THEME.colors.textMuted,
    marginHorizontal: THEME.spacing.md,
    fontSize: 12,
  },
  appleBtn: {
    borderColor: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: THEME.spacing.xl,
  },
  footerText: {
    color: THEME.colors.textMuted,
  },
  registerLink: {
    color: THEME.colors.primary,
    fontWeight: 'bold',
  },
});
