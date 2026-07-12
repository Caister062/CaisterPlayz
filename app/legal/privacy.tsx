import React from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { THEME } from '../../lib/theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.date}>Effective Date: July 12, 2026</Text>

      <Text style={styles.paragraph}>
        At NEXORA, your privacy and data security are central to our design. This Privacy Policy details what information we collect and how we secure it.
      </Text>

      <Text style={styles.heading}>1. Data We Collect</Text>
      <Text style={styles.paragraph}>
        We collect only minimal account information: Email address, display name, chosen username, bio, and preferred gaming platforms/play style. We do not collect real names, phone numbers, contact books, or precise GPS coordinates.
      </Text>

      <Text style={styles.heading}>2. Secure Storage & Authentication</Text>
      <Text style={styles.paragraph}>
        Account sessions are stored securely using hardware-backed SecureStore keys. Database access uses Row Level Security (RLS) ensuring that users cannot access private posts or modify other profiles.
      </Text>

      <Text style={styles.heading}>3. Media Uploads</Text>
      <Text style={styles.paragraph}>
        Uploaded avatars and timeline screenshots are hosted on secure Supabase Storage buckets. Deleting your account will automatically remove all associated files.
      </Text>

      <Text style={styles.heading}>4. Safety Moderation</Text>
      <Text style={styles.paragraph}>
        Text posts and comments are parsed for safety. Reports of inappropriate content will prompt human moderator review.
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
