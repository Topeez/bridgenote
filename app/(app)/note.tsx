import { useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { saveNote, deleteNote, getNoteById } from '@/stores/noteStore';

type Note = {
  id: string;
  title: string;
  content: string;
  created: string;
  updated: string;
}

export default function NoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      getNoteById(id).then((note: Note) => {
        if (note) {
          setTitle(note.title);
          setContent(note.content);
        }
      });
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNote(id, title, content);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteNote(id);
        router.back();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.actions}>
          {!isNew && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </View>
      <TextInput style={styles.titleInput} placeholder="Title" value={title}
        onChangeText={setTitle} placeholderTextColor="#ccc" />
      <TextInput style={styles.contentInput} placeholder="Start writing..." value={content}
        onChangeText={setContent} multiline textAlignVertical="top" placeholderTextColor="#ccc" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  back: { fontSize: 16, color: '#000' },
  actions: { flexDirection: 'row', gap: 8 },
  saveBtn: { backgroundColor: '#000', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveText: { color: '#fff', fontWeight: '600' },
  deleteBtn: { backgroundColor: '#ff3b30', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  deleteText: { color: '#fff', fontWeight: '600' },
  titleInput: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 20, marginBottom: 12, color: '#000' },
  contentInput: { flex: 1, fontSize: 16, paddingHorizontal: 20, lineHeight: 24, color: '#000' },
});
