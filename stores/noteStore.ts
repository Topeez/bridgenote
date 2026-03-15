import AsyncStorage from '@react-native-async-storage/async-storage';
import pb from '../lib/pocketbase';

const CACHE_KEY = 'notes_cache';

export const getNotes = async () => {
  try {
    const records = await pb.collection('notes').getFullList({
      sort: '-updated',
      filter: `user = "${pb.authStore.record?.id}"`,
    });
    // update cache on successful fetch
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(records));
    return records;
  } catch {
    // offline — return cached notes
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

export const saveNote = async (id: string, title: string, content: string) => {
  const data = { title, content, user: pb.authStore.record?.id };
  if (id === 'new') {
    return pb.collection('notes').create(data);
  }
  return pb.collection('notes').update(id, data);
};

export const deleteNote = async (id: string) => {
  return pb.collection('notes').delete(id);
};

export const getNoteById = async (id: string) => {
  try {
    return await pb.collection('notes').getOne(id);
  } catch {

    const cached = await AsyncStorage.getItem(CACHE_KEY);
    const notes = cached ? JSON.parse(cached) : [];
    return notes.find((n: any) => n.id === id) ?? null;
  }
};
