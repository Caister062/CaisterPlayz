import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { THEME } from '../../lib/theme';
import { JourneyEntry, JourneyComment } from '../../lib/types';
import { Send as ISend, AlertTriangle as IAlertTriangle, Trash as ITrash } from 'lucide-react-native';
const Send = ISend as any;
const AlertTriangle = IAlertTriangle as any;
const Trash = ITrash as any;

export default function JourneyDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<JourneyEntry | null>(null);
  const [comments, setComments] = useState<JourneyComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      // Fetch Entry
      const { data: entryData, error: entryErr } = await supabase
        .from('journey_entries')
        .select('*, profiles(*), games(*)')
        .eq('id', id)
        .maybeSingle();

      if (entryErr || !entryData) {
        Alert.alert('Not Found', 'The journey entry does not exist or has been removed.');
        return;
      }
      setEntry(entryData as JourneyEntry);

      // Fetch Comments
      const { data: commentsData } = await supabase
        .from('journey_comments')
        .select('*, profiles(*)')
        .eq('entry_id', id)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: true });

      setComments(commentsData as JourneyComment[] || []);

    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('journey_comments').insert({
        entry_id: id,
        user_id: user.id,
        comment_text: newComment.trim(),
        moderation_status: 'approved',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setNewComment('');
        fetchDetails();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('journey_comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      fetchDetails();
    }
  };

  const handleReportComment = (commentId: string) => {
    Alert.prompt(
      'Report Comment',
      'Please state the reason for reporting this comment:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Report',
          onPress: async (reason) => {
            if (!reason) return;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase.from('reports').insert({
              reporter_id: user.id,
              content_type: 'comment',
              content_id: commentId,
              reason,
              status: 'pending',
            });

            if (!error) {
              Alert.alert('Report Submitted', 'The comment will be reviewed by moderation.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: '#ffffff' }}>Entry not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main entry summary card */}
        <View style={styles.entryCard}>
          <Text style={styles.username}>@{entry.profiles?.username}</Text>
          <Text style={styles.title}>{entry.title}</Text>
          {entry.description && <Text style={styles.desc}>{entry.description}</Text>}
          <Text style={styles.meta}>
            {entry.entry_type.replace('_', ' ').toUpperCase()} • {entry.games?.title || 'General'}
          </Text>
        </View>

        {/* Comments Section */}
        <Text style={styles.sectionHeader}>Discussion ({comments.length})</Text>

        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.commentUser}>@{comment.profiles?.username}</Text>
              <Text style={styles.commentText}>{comment.comment_text}</Text>
            </View>
            <View style={styles.commentActions}>
              {comment.user_id === currentUserId ? (
                <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                  <Trash size={14} color={THEME.colors.danger} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleReportComment(comment.id)}>
                  <AlertTriangle size={14} color={THEME.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Add to the discussion..."
          placeholderTextColor={THEME.colors.textMuted}
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handlePostComment}>
          <Send size={18} color="#050814" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingBottom: 80,
  },
  entryCard: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  username: {
    color: THEME.colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  desc: {
    color: THEME.colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  meta: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.sm,
  },
  commentRow: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.sm,
    padding: THEME.spacing.sm,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUser: {
    color: THEME.colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    color: THEME.colors.text,
    fontSize: 13,
  },
  commentActions: {
    marginLeft: THEME.spacing.sm,
  },
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.surface,
    borderTopColor: THEME.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: THEME.spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: THEME.roundness.md,
    color: '#ffffff',
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
