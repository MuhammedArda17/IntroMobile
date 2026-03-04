import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';


export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welkom bij IntroMobile!</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/create-match' as any)}
      >
        <Text style={styles.buttonText}>Wedstrijd aanmaken</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32 },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', width: '80%' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});