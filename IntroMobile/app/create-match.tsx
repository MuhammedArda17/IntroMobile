import { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { createMatch } from '../src/firebase/matches';

const CLUBS = [
  { id: '1', name: 'Padel Sporthaven Mortsel' },
  { id: '2', name: 'El Citadel Borsbeek' },
  { id: '3', name: 'GARRINCHA Antwerpen Zuid' },
];

const TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'];

export default function CreateMatchScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [selectedClub, setSelectedClub] = useState<typeof CLUBS[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [levelMin, setLevelMin] = useState('1.0');
  const [levelMax, setLevelMax] = useState('7.0');
  const [isMixed, setIsMixed] = useState(false);
  const [isCompetitive, setIsCompetitive] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0,2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0,2)}/${cleaned.slice(2,4)}/${cleaned.slice(4,8)}`;
  };

  const handleCreate = async () => {
    if (!selectedClub || !selectedTime || !selectedDate) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    const min = parseFloat(levelMin);
    const max = parseFloat(levelMax);

    if (isNaN(min) || isNaN(max) || min < 0.5 || max > 7 || min > max) {
      Alert.alert('Fout', 'Niveau moet tussen 0.5 en 7 zijn en min moet kleiner zijn dan max');
      return;
    }

    const [day, month, year] = selectedDate.split('/');
    const matchDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (matchDate < today) {
      Alert.alert('Fout', 'De datum moet in de toekomst liggen');
      return;
    }

    setLoading(true);
    try {
      await createMatch({
        creatorId: user!.uid,
        creatorName: user!.name,
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        date: matchDate,
        time: selectedTime,
        levelMin: min,
        levelMax: max,
        isMixed,
        isCompetitive,
        fieldId: `field_${selectedClub.id}`,
      });

      Alert.alert('Succes', 'Wedstrijd aangemaakt!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      Alert.alert('Fout', 'Kon wedstrijd niet aanmaken: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wedstrijd aanmaken</Text>

      <Text style={styles.label}>Club</Text>
      {CLUBS.map((club) => (
        <TouchableOpacity
          key={club.id}
          style={[styles.optionButton, selectedClub?.id === club.id && styles.optionSelected]}
          onPress={() => setSelectedClub(club)}
        >
          <Text style={[styles.optionText, selectedClub?.id === club.id && styles.optionTextSelected]}>
            {club.name}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Datum</Text>
      <TextInput
        style={styles.input}
        placeholder="bijv. 15/03/2025"
        value={selectedDate}
        onChangeText={(text) => setSelectedDate(formatDate(text))}
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Tijdstip</Text>
      <View style={styles.timeGrid}>
        {TIMES.map((time) => (
          <TouchableOpacity
            key={time}
            style={[styles.timeButton, selectedTime === time && styles.timeSelected]}
            onPress={() => setSelectedTime(time)}
          >
            <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Niveau range</Text>
      <View style={styles.levelContainer}>
        <View style={styles.levelInput}>
          <Text style={styles.levelLabel}>Min</Text>
          <TextInput
            style={styles.input}
            value={levelMin}
            onChangeText={setLevelMin}
            keyboardType="numeric"
            placeholder="0.5"
          />
        </View>
        <View style={styles.levelInput}>
          <Text style={styles.levelLabel}>Max</Text>
          <TextInput
            style={styles.input}
            value={levelMax}
            onChangeText={setLevelMax}
            keyboardType="numeric"
            placeholder="7.0"
          />
        </View>
      </View>

      <Text style={styles.label}>Gemengd</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, isMixed === false && styles.toggleSelected]}
          onPress={() => setIsMixed(false)}
        >
          <Text style={[styles.toggleText, isMixed === false && styles.toggleTextSelected]}>Nee</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isMixed === true && styles.toggleSelected]}
          onPress={() => setIsMixed(true)}
        >
          <Text style={[styles.toggleText, isMixed === true && styles.toggleTextSelected]}>Ja</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Competitief</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, isCompetitive === false && styles.toggleSelected]}
          onPress={() => setIsCompetitive(false)}
        >
          <Text style={[styles.toggleText, isCompetitive === false && styles.toggleTextSelected]}>Nee</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isCompetitive === true && styles.toggleSelected]}
          onPress={() => setIsCompetitive(true)}
        >
          <Text style={[styles.toggleText, isCompetitive === true && styles.toggleTextSelected]}>Ja</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCreate}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Bezig...' : 'Wedstrijd aanmaken'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  optionButton: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
  optionSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  optionText: { fontSize: 15, color: '#333' },
  optionTextSelected: { color: '#fff', fontWeight: 'bold' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  timeButton: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', minWidth: 70, alignItems: 'center' },
  timeSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  timeText: { fontSize: 14, color: '#333' },
  timeTextSelected: { color: '#fff', fontWeight: 'bold' },
  levelContainer: { flexDirection: 'row', gap: 16 },
  levelInput: { flex: 1 },
  levelLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  toggleRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  toggleButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  toggleSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  toggleText: { fontSize: 15, color: '#333' },
  toggleTextSelected: { color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});