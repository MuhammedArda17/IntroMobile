import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser, getUserData } from '../src/firebase/auth';
import { useAuthStore } from '../src/store/useAuthStore';

const BG_IMAGE = { uri: 'https://padelmagazine.fr/wp-content/uploads/2023/10/17385996__B4A1521_Yasmine_Akki_20230910_185440-scaled.jpg' };

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      const userData = await getUserData(user.uid);
      setUser(userData as any);
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      Alert.alert('Fout', 'Email of wachtwoord incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={BG_IMAGE} style={styles.container} resizeMode="cover">
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : 'height'}
        keyboardVerticalOffset={-100}
        style={styles.keyboardView}
      >
        <View style={styles.topSection}>
          <Text style={styles.appName}>PadelApp</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Inloggen</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Wachtwoord"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Bezig...' : 'Inloggen'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register' as any)}>
            <Text style={styles.link}>Nog geen account? <Text style={styles.linkBold}>Registreer hier</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  keyboardView: { flex: 1, justifyContent: 'flex-end' },
  topSection: { alignItems: 'center', paddingBottom: 40 },
  appName: { fontSize: 42, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  form: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingTop: 40, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, color: '#333', backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#0f3460', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#888', fontSize: 14 },
  linkBold: { color: '#0f3460', fontWeight: 'bold' },
});