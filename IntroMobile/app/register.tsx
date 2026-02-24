import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser, getUserData } from '../src/firebase/auth';
import { useAuthStore } from '../src/store/useAuthStore';

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Account aanmaken</Text>

      
      <TextInput
        style={styles.input}
        placeholder="Naam"
        placeholderTextColor="#000"
        value={name}
        onChangeText={setName}
      />


      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#000"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Wachtwoord"
        placeholderTextColor="#000"
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
            <Text style={[styles.genderText, gender === g && styles.genderTextSelected]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.info}>Je start automatisch op niveau 1.5</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Bezig...' : 'Registreren'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login'as any)}>
        <Text style={styles.link}>Al een account? Log hier in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, color: '#000' },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '500' },
  genderContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  genderButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  genderSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  genderText: { fontSize: 16, color: '#333' },
  genderTextSelected: { color: '#fff', fontWeight: 'bold' },
  info: { textAlign: 'center', color: '#888', marginBottom: 24, fontSize: 14 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#007AFF', fontSize: 14 },
});