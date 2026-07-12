import React from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { THEME } from '../../lib/theme';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>
      <Text style={styles.date}>Effective Date: July 12, 2026</Text>

      <Text style={styles.paragraph}>
        Welcome to NEXORA. By accessing or using our mobile application, you agree to comply with and be bound by these Terms of Service.
      </Text>

      <Text style={styles.heading}>1. Age Requirement</Text>
      <Text style={styles.paragraph}>
        You must be at least 13 years of age or older to register for an account on NEXORA. If you are under the age of 13, you are strictly prohibited from using the platform.
      </Text>

      <Text style={styles.heading}>2. User Generated Content</Text>
      <Text style={styles.paragraph}>
        NEXORA acts as an open timeline for sharing personal gaming journey accomplishments, screenshot memories, and match beacon lobbies. You retain ownership of your content, but grant NEXORA a worldwide license to host and display it. You are responsible for ensuring that your submissions do not infringe copyrights or trademark permissions.
      </Text>

      <Text style={styles.heading}>3. Code of Conduct</Text>
      <Text style={styles.paragraph}>
        You agree not to post harassment, toxic messages, spam, or copyrighted material. Violations will result in content quarantine, account mute actions, or permanent profile suspension.
      </Text>

      <Text style={styles.heading}>4. Account Deletion</Text>
      <Text style={styles.paragraph}>
        Users can request permanent account deletion at any time under settings. Deletion will purge all username records, profile visibility, comments, and uploads, retaining only legally mandatory records.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginBottom: THEME.spacing.md,
  },
  heading: {
    color: THEME.colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: THEME.spacing.md,
    marginBottom: 6,
  },
  paragraph: {
    color: THEME.colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: THEME.spacing.sm,
  },
});
