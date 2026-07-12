import React from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { THEME } from '../../lib/theme';

export default function CommunityGuidelinesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Community Guidelines</Text>
      <Text style={styles.date}>Effective Date: July 12, 2026</Text>

      <Text style={styles.paragraph}>
        NEXORA is a space dedicated to celebrating our gaming journeys and meeting teammates. To keep this community safe and fun for everyone, all users must follow these rules.
      </Text>

      <Text style={styles.heading}>1. No Toxicity or Harassment</Text>
      <Text style={styles.paragraph}>
        Treat your fellow gamers with respect. Do not mock, flame, threaten, or bully players who share their achievements, no matter their skill level.
      </Text>

      <Text style={styles.heading}>2. Fair Play & Beacon Reliability</Text>
      <Text style={styles.paragraph}>
        When creating or joining a Match Beacon lobby, be reliable. Do not spam beacons, run scams, or cheat during game lobbies. If you cannot join a session, update your coordination status to let other team members know.
      </Text>

      <Text style={styles.heading}>3. Appropriate Content Only</Text>
      <Text style={styles.paragraph}>
        All uploaded screenshot memories and display fields must be appropriate. Do not post NSFW media, explicit text, drug references, or copyright violations.
      </Text>

      <Text style={styles.heading}>4. Reporting Violations</Text>
      <Text style={styles.paragraph}>
        If you spot content violating these guidelines, tap the Flag/Report button. Reported content is immediately queued for safety review and quarantined.
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
