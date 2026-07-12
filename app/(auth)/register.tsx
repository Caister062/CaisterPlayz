import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [isOlderThan13, setIsOlderThan13] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all credentials fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (!isOlderThan13) {
      Alert.alert('Error', 'You must verify that you meet the minimum age requirement of 13 years old.');
      return;
    }

    if (!acceptPolicies) {
      Alert.alert('Error', 'You must read and accept the Terms of Service, Privacy Policy, and Community Guidelines.');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Registration Failed', error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Record legal policy acceptance
      const { error: policyError } = await supabase.from('policy_acceptances').insert({
        user_id: data.user.id,
        policy_version: 'v1.0.0',
        accepted_at: new Date().toISOString(),
      });

      if (policyError) {
        // Log silently
      }

      Alert.alert(
        'Registration Success',
        'Verification link sent! Please check your email or proceed to onboarding.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/onboarding') }]
      );
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.formCard}>
        <Text style={styles.title}>Create NEXORA Account</Text>

        <Input
          label="Email Address"
          placeholder="gamer@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Age Requirement Selection */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={[styles.checkbox, isOlderThan13 && styles.checkboxActive]}
            onPress={() => setIsOlderThan13(!isOlderThan13)}
          >
            {isOlderThan13 && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I confirm that I am <Text style={styles.boldText}>13 years of age or older</Text> (Minimum age requirement).
          </Text>
        </View>

        {/* Legal Policies Agreement */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity 
            style={[styles.checkbox, acceptPolicies && styles.checkboxActive]}
            onPress={() => setAcceptPolicies(!acceptPolicies)}
          >
            {acceptPolicies && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <View style={styles.legalLinksContainer}>
            <Text style={styles.checkboxLabel}>
              I accept the NEXORA{' '}
              <Text style={styles.link} onPress={() => router.push('/legal/terms')}>Terms of Service</Text>,{' '}
              <Text style={styles.link} onPress={() => router.push('/legal/privacy')}>Privacy Policy</Text>, and{' '}
              <Text style={styles.link} onPress={() => router.push('/legal/guidelines')}>Community Guidelines</Text>.
            </Text>
          </View>
        </View>

        <Button
          title="Sign Up"
          onPress={handleRegister}
          loading={loading}
          style={styles.actionBtn}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>Sign In</Text>
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
  formCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.lg,
    padding: THEME.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderColor: THEME.colors.border,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: THEME.spacing.sm,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  checkboxActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  checkmark: {
    color: '#050814',
    fontWeight: 'bold',
    fontSize: 12,
  },
  checkboxLabel: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  boldText: {
    color: THEME.colors.text,
    fontWeight: 'bold',
  },
  legalLinksContainer: {
    flex: 1,
  },
  link: {
    color: THEME.colors.primary,
    textDecorationLine: 'underline',
  },
  actionBtn: {
    marginTop: THEME.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: THEME.spacing.xl,
  },
  footerText: {
    color: THEME.colors.textMuted,
  },
  loginLink: {
    color: THEME.colors.primary,
    fontWeight: 'bold',
  },
});
