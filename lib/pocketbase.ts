import PocketBase, { AsyncAuthStore } from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const store = new AsyncAuthStore({
  save: async (serialized) => AsyncStorage.setItem('pb_auth', serialized),
  initial: AsyncStorage.getItem('pb_auth').then((v) => v ?? undefined),
  clear: async () => AsyncStorage.removeItem('pb_auth'),
});

const BASE_URL = Platform.select({
  web: 'http://localhost:8090',
  default: 'http://192.168.0.191:8090',
});

const pb = new PocketBase(BASE_URL, store);
export default pb;
