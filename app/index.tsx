import { Redirect } from 'expo-router';
import pb from '../lib/pocketbase';

export default function Index() {
  const isLoggedIn = pb.authStore.isValid;
  return <Redirect href={isLoggedIn ? '/(app)' : '/(auth)/login'} />;
}
