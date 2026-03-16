import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser, getUserData } from '../src/firebase/auth';
import { useAuthStore } from '../src/store/useAuthStore';

const BG_IMAGE = { uri: 'https://www.datocms-assets.com/115107/1715858196-503131f0-5713-41e5-8935-56eea0f5fefb-1.jpg?auto=compress&crop=focalpoint&dpr=1.65&fit=crop&fm=webp&h=500&q=85&w=612' };

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const handleRegister = async () => {
    if (!name || !email || !password || !gender) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser(email, password, name, gender);
      const userData = await getUserData(user.uid);
      setUser(userData as any);
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      Alert.alert('Fout', 'Registratie mislukt: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={BG_IMAGE} style={{ flex: 1 }} resizeMode="cover">
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topSection}>
          <Text style={styles.appName}>PadelApp</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Account aanmaken</Text>

          <TextInput
            style={styles.input}
            placeholder="Naam"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

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

          <Text style={styles.label}>Geslacht</Text>
          <View style={styles.genderContainer}>
            {['Man', 'Vrouw'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.genderButton, gender === g && styles.genderSelected]}
                onPress={() => setGender(g)}
              >
                <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.info}>🏓 Je start automatisch op niveau 1.5</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Bezig...' : 'Registreren'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/login' as any)}>
            <Text style={styles.link}>Al een account? <Text style={styles.linkBold}>Log hier in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  container: { flexGrow: 1 },
  topSection: { flex: 1, minHeight: 200, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 32 },
  appName: { fontSize: 42, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  form: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, paddingTop: 40, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, color: '#333', backgroundColor: '#f9f9f9' },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 8 },
  genderContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  genderButton: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee', alignItems: 'center', backgroundColor: '#f9f9f9' },
  genderSelected: { backgroundColor: '#0f3460', borderColor: '#0f3460' },
  genderText: { fontSize: 15, color: '#333' },
  genderTextSelected: { color: '#fff', fontWeight: 'bold' },
  info: { textAlign: 'center', color: '#888', marginBottom: 24, fontSize: 13 },
  button: { backgroundColor: '#0f3460', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#888', fontSize: 14 },
  linkBold: { color: '#0f3460', fontWeight: 'bold' },
});