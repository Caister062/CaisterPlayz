import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { Report } from '../../lib/types';
import { Button } from '../../components/ui/Button';
import { Shield as IShield, Check as ICheck, Ban as IBan, EyeOff as IEyeOff } from 'lucide-react-native';
const Shield = IShield as any;
const Check = ICheck as any;
const Ban = IBan as any;
const EyeOff = IEyeOff as any;

export default function ModeratorDashboard() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setReports(data as Report[]);
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const { error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', reportId);

    if (!error) {
      Alert.alert('Report Updated', `Report status marked as ${status}.`);
      fetchReports();
    }
  };

  const handleQuarantineContent = async (report: Report) => {
    try {
      let tableName = '';
      if (report.content_type === 'journey_entry') tableName = 'journey_entries';
      else if (report.content_type === 'comment') tableName = 'journey_comments';

      if (!tableName) return;

      const { error } = await supabase
        .from(tableName)
        .update({ moderation_status: 'quarantined' })
        .eq('id', report.content_id);

      if (!error) {
        // Resolve report
        await supabase.from('reports').update({ status: 'resolved' }).eq('id', report.id);
        Alert.alert('Quarantined', 'The content was safely quarantined and hidden from feeds.');
        fetchReports();
      }
    } catch (e: any) {
      Alert.alert('Action Failed', e.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Shield size={24} color={THEME.colors.warning} />
        <Text style={styles.title}>Safety Reports Queue</Text>
      </View>

      {reports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={{ color: THEME.colors.textMuted }}>No active reports queued. NEXORA is safe!</Text>
        </View>
      ) : (
        reports.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <Text style={styles.contentType}>FLAGGED: {report.content_type.toUpperCase()}</Text>
              <Text style={[styles.statusText, report.status === 'pending' ? styles.statusPending : styles.statusResolved]}>
                {report.status.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.reasonText}>Reason: {report.reason}</Text>
            {report.details && (
              <Text style={styles.detailsText}>Details: {report.details}</Text>
            )}

            {/* Moderator Action controls */}
            {report.status === 'pending' && (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: THEME.colors.success }]}
                  onPress={() => handleResolveReport(report.id, 'dismissed')}
                >
                  <Check size={14} color="#050814" />
                  <Text style={styles.btnText}>Dismiss</Text>
                </TouchableOpacity>

                {(report.content_type === 'journey_entry' || report.content_type === 'comment') && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: THEME.colors.warning }]}
                    onPress={() => handleQuarantineContent(report)}
                  >
                    <EyeOff size={14} color="#050814" />
                    <Text style={styles.btnText}>Quarantine</Text>
                  </TouchableOpacity>
                )}

                {report.reported_user_id && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: THEME.colors.danger }]}
                    onPress={async () => {
                      // Suspend user logic integration mock
                      await supabase.from('moderation_actions').insert({
                        target_user_id: report.reported_user_id,
                        action_type: 'warning',
                        reason: `Reported for: ${report.reason}`,
                      });
                      await handleResolveReport(report.id, 'resolved');
                      Alert.alert('Warning Issued', 'A safety warning was logged to this user profile.');
                    }}
                  >
                    <Ban size={14} color="#ffffff" />
                    <Text style={[styles.btnText, { color: '#ffffff' }]}>Warn Gamer</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors.background,
    padding: THEME.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  reportCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contentType: {
    color: THEME.colors.danger,
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusPending: {
    backgroundColor: 'rgba(255, 209, 102, 0.15)',
    color: THEME.colors.warning,
  },
  statusResolved: {
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    color: THEME.colors.success,
  },
  reasonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  detailsText: {
    color: THEME.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginTop: THEME.spacing.md,
    borderTopColor: THEME.colors.border,
    borderTopWidth: 1,
    paddingTop: THEME.spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.roundness.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  btnText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#050814',
  },
});
