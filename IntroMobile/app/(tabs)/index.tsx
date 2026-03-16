import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';

const BG_IMAGE = { uri: 'https://padelmagazine.fr/wp-content/uploads/2023/10/17385996__B4A1521_Yasmine_Akki_20230910_185440-scaled.jpg' };

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container}>
      <ImageBackground source={BG_IMAGE} style={styles.header} resizeMode="cover">
        <View style={styles.headerOverlay} />
        <Text style={styles.headerTitle}>🏓 PadelApp</Text>
        <Text style={styles.headerSubtitle}>Welkom, {user?.name}!</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Niveau {user?.level}</Text>
        </View>
      </ImageBackground>

      <Text style={styles.sectionTitle}>Wat wil je doen?</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/create-match' as any)}
      >
        <Text style={styles.cardIcon}>⚔️</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Wedstrijd aanmaken</Text>
          <Text style={styles.cardSubtitle}>Maak een nieuwe wedstrijd aan en zoek spelers</Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/search-match' as any)}
      >
        <Text style={styles.cardIcon}>🔍</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Wedstrijd zoeken</Text>
          <Text style={styles.cardSubtitle}>Vind een wedstrijd op jouw niveau</Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/results' as any)}
      >
        <Text style={styles.cardIcon}>🏆</Text>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Resultaten invoeren</Text>
          <Text style={styles.cardSubtitle}>Voer scores in van gespeelde wedstrijden</Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { height: 250, padding: 24, paddingTop: 60, paddingBottom: 32, justifyContent: 'flex-end' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  levelBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  levelText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', margin: 16, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardIcon: { fontSize: 32, marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#888' },
  cardArrow: { fontSize: 24, color: '#ccc', fontWeight: 'bold' },
});