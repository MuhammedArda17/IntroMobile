import { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { createMatch, getClubs,getBookedSlots } from '../src/firebase/matches';
import DateTimePicker from '@react-native-community/datetimepicker';

const TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00','19:00','20:00', '21:00'];

export default function CreateMatchScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [levelMin, setLevelMin] = useState('1.0');
  const [levelMax, setLevelMax] = useState('7.0');
  const [isMixed, setIsMixed] = useState(false);
  const [isCompetitive, setIsCompetitive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
  if (selectedClub && selectedDate) {
    const dateString = selectedDate.toISOString().split('T')[0];
    getBookedSlots(selectedClub.id, dateString).then(setBookedSlots);
    setSelectedTime('');
  }
}, [selectedClub, selectedDate]);

  useEffect(() => {
    const fetchClubs = async () => {
      const data = await getClubs();
      setClubs(data);
    };
    fetchClubs();
  }, []);

  const handleCreate = async () => {
    if (!selectedClub || !selectedTime) {
      Alert.alert('Fout', 'Vul alle velden in');
      return;
    }

    const min = parseFloat(levelMin);
    const max = parseFloat(levelMax);

    if (isNaN(min) || isNaN(max) || min < 0.5 || max > 7 || min > max) {
      Alert.alert('Fout', 'Niveau moet tussen 0.5 en 7 zijn en min moet kleiner zijn dan max');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
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
        date: selectedDate,
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
      {clubs.map((club) => (
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
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{selectedDate.toLocaleDateString('nl-BE')}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Tijdstip</Text>
      <View style={styles.timeGrid}>
  {TIMES.map((time) => {
    const isBooked = bookedSlots.includes(time);
    return (
      <TouchableOpacity
        key={time}
        style={[
          styles.timeButton,
          selectedTime === time && styles.timeSelected,
          isBooked && styles.timeBooked
        ]}
        onPress={() => !isBooked && setSelectedTime(time)}
        disabled={isBooked}
      >
        <Text style={[
          styles.timeText,
          selectedTime === time && styles.timeTextSelected,
          isBooked && styles.timeTextBooked
        ]}>
          {time}
        </Text>
      </TouchableOpacity>
    );
  })}
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
  dateButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8 },
  dateText: { fontSize: 16, color: '#333' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timeBooked: { backgroundColor: '#f0f0f0', borderColor: '#ddd' },
timeTextBooked: { color: '#aaa' },
});