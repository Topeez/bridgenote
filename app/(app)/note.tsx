import { useEffect, useState, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Alert, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDebouncedCallback } from 'use-debounce';
import { saveNote, deleteNote, getNoteById } from '@/stores/noteStore';
import { Colors, Theme } from '../../constants/theme';
import * as Haptics from 'expo-haptics';

type Note = {
  id: string;
  title: string;
  content: string;
  created: string;
  updated: string;
};

export default function NoteScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const noteId = useRef<string>(id);

  useEffect(() => {
    if (!isNew) {
      getNoteById(id).then((note: Note) => {
        if (note) { setTitle(note.title); setContent(note.content); }
      });
    }
  }, [id, isNew]);

  const debouncedSave = useDebouncedCallback(async (t: string, c: string) => {
    if (!t && !c) return;
    setStatus('saving');
    try {
      const result = await saveNote(noteId.current, t, c);
      if (isNew) noteId.current = result.id;
      setStatus('saved');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('idle');
    }
  }, 1500);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    debouncedSave(val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    debouncedSave(title, val);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteNote(noteId.current);
        router.back();
      }},
    ]);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: Theme.spacing.lg, marginBottom: Theme.spacing.md,
      borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: Theme.spacing.md },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.xs },
    backText: { fontSize: Theme.font.md, color: colors.accent, fontWeight: '500' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.sm },
    status: { flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.xs, color: colors.accent },
    statusText: { fontSize: Theme.font.xs, color: colors.accent },
    deleteBtn: { backgroundColor: colors.danger, paddingHorizontal: Theme.spacing.md,
      paddingVertical: Theme.spacing.xs + 2, borderRadius: Theme.radius.full,
      flexDirection: 'row', alignItems: 'center', gap: Theme.spacing.xs },
    deleteText: { color: '#fff', fontWeight: '600', fontSize: Theme.font.sm },
    titleInput: { fontSize: Theme.font.xxl, fontWeight: '800', paddingHorizontal: Theme.spacing.lg,
      paddingTop: Theme.spacing.lg, marginBottom: Theme.spacing.sm,
      color: colors.primary, letterSpacing: -0.5 },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: Theme.spacing.lg, marginBottom: Theme.spacing.md },
    contentInput: { flex: 1, fontSize: Theme.font.md, paddingHorizontal: Theme.spacing.lg,
      lineHeight: 24, color: colors.primary, textAlignVertical: 'top' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>Notes</Text>
        </TouchableOpacity>
        <View style={styles.actions}>
          <Text style={styles.status}>Autosave enabled</Text>
          {status === 'saving' && <Text style={styles.statusText}>Saving...</Text>}
          {status === 'saved' && <Text style={styles.statusText}>✓ Saved</Text>}
          {!isNew && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={14} color="#fff" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TextInput style={styles.titleInput} placeholder="Title" value={title}
        onChangeText={handleTitleChange} placeholderTextColor={colors.muted} />
      <View style={styles.divider} />
      <TextInput style={styles.contentInput} placeholder="Start writing..." value={content}
        onChangeText={handleContentChange} multiline textAlignVertical="top"
        placeholderTextColor={colors.muted} />
    </View>
  );
}
