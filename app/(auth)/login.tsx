import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  KeyboardAvoidingView, Platform, useColorScheme, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import pb from '../../lib/pocketbase';
import { Colors, Theme } from '../../constants/theme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [emailVisibility, setEmailVisibility] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    if (!isLogin && password !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match');
    if (!isLogin && name.trim().length < 2)
      return Alert.alert('Error', 'Please enter your name');

    setLoading(true);
    try {
      if (isLogin) {
        await pb.collection('users').authWithPassword(email, password);
      } else {
        await pb.collection('users').create({
          email,
          password,
          passwordConfirm: confirmPassword,
          name: name.trim(),
          emailVisibility,
        });
        await pb.collection('users').authWithPassword(email, password);
      }
      router.replace('/(app)');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    inner: { flexGrow: 1, justifyContent: 'center', padding: Theme.spacing.lg },
    hero: { alignItems: 'center', marginBottom: Theme.spacing.xl },
    appName: { fontSize: Theme.font.xxxl, fontWeight: '800', color: colors.primary, letterSpacing: -1, marginTop: Theme.spacing.sm },
    tagline: { fontSize: Theme.font.md, color: colors.secondary, marginTop: 4 },
    form: { gap: Theme.spacing.sm },
    label: { fontSize: Theme.font.sm, fontWeight: '600', color: colors.secondary, marginBottom: 2 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface,
      borderWidth: 1, borderColor: colors.border, borderRadius: Theme.radius.md },
    input: { flex: 1, padding: Theme.spacing.md, fontSize: Theme.font.md, color: colors.primary },
    eyeBtn: { paddingHorizontal: Theme.spacing.md },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: Theme.radius.md, padding: Theme.spacing.md },
    switchLabel: { fontSize: Theme.font.md, color: colors.primary },
    switchSub: { fontSize: Theme.font.xs, color: colors.muted, marginTop: 2 },
    button: { backgroundColor: colors.accent, borderRadius: Theme.radius.md,
      padding: Theme.spacing.md, alignItems: 'center', marginTop: Theme.spacing.sm },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: Theme.font.md },
    toggle: { alignItems: 'center', marginTop: Theme.spacing.sm },
    toggleText: { fontSize: Theme.font.sm, color: colors.secondary },
    toggleLink: { color: colors.accent, fontWeight: '600' },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <MaterialCommunityIcons name="note-plus" size={52} color={colors.accent} />
          <Text style={styles.appName}>Bridgenote</Text>
          <Text style={styles.tagline}>Your notes, everywhere.</Text>
        </View>

        <View style={styles.form}>

          {/* Name — register only */}
          {!isLogin && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={name} onChangeText={setName}
                  placeholder="John Doe" placeholderTextColor={colors.muted} />
              </View>
            </>
          )}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={email} onChangeText={setEmail}
              placeholder="you@example.com" placeholderTextColor={colors.muted}
              autoCapitalize="none" keyboardType="email-address" />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} value={password} onChangeText={setPassword}
              placeholder="••••••••" placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword} />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Confirm password + emailVisibility — register only */}
          {!isLogin && (
            <>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword}
                  placeholder="••••••••" placeholderTextColor={colors.muted} secureTextEntry={!showPassword} />
              </View>

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>Public email</Text>
                  <Text style={styles.switchSub}>Let others see your email address</Text>
                </View>
                <Switch value={emailVisibility} onValueChange={setEmailVisibility}
                  trackColor={{ true: colors.accent }} thumbColor="#fff" />
              </View>
            </>
          )}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.toggleLink}>{isLogin ? 'Register' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
