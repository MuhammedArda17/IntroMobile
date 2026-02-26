import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { createBooking } from '../../src/firebase/firestore';
import { CLUBS, TIME_SLOTS } from '../../src/constants/clubs';

export default function BookScreen() {
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);

  // Genereer de komende 7 dagen
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        label: date.toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' }),
        value: date.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const handleBooking = async () => {
    if (!selectedClub || !selectedDate || !selectedTime) {
      Alert.alert('Fout', 'Selecteer een club, datum en tijdslot');
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        date: selectedDate,
        timeSlot: selectedTime,
        userId: user!.uid,
        userName: user!.name
      });
      Alert.alert('Gelukt!', `Boeking bevestigd voor ${selectedClub.name} op ${selectedDate} om ${selectedTime}`);
      setSelectedClub(null);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      Alert.alert('Fout', 'Boeking mislukt, probeer opnieuw');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Veld Boeken</Text>

      {/* Club selectie */}
      <Text style={styles.sectionTitle}>Kies een club</Text>
      {CLUBS.map((club) => (
        <TouchableOpacity
          key={club.id}
          style={[styles.card, selectedClub?.id === club.id && styles.cardSelected]}
          onPress={() => setSelectedClub(club)}
        >
          <Text style={styles.clubEmoji}>{club.image}</Text>
          <View>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubAddress}>{club.address}</Text>
            <Text style={styles.clubCourts}>{club.courts} velden</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Datum selectie */}
      <Text style={styles.sectionTitle}>Kies een datum</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {getDates().map((date) => (
          <TouchableOpacity
            key={date.value}
            style={[styles.dateButton, selectedDate === date.value && styles.dateSelected]}
            onPress={() => setSelectedDate(date.value)}
          >
            <Text style={[styles.dateText, selectedDate === date.value && styles.dateTextSelected]}>
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tijdslot selectie */}
      <Text style={styles.sectionTitle}>Kies een tijdslot</Text>
      <View style={styles.timeGrid}>
        {TIME_SLOTS.map((time) => (
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

      {/* Bevestig knop */}
      <TouchableOpacity
        style={[styles.bookButton, loading && styles.bookButtonDisabled]}
        onPress={handleBooking}
        disabled={loading}
      >
        <Text style={styles.bookButtonText}>
          {loading ? 'Bezig...' : 'Bevestig Boeking'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 12, color: '#333' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: '#007AFF' },
  clubEmoji: { fontSize: 32, marginRight: 12 },
  clubName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  clubAddress: { fontSize: 13, color: '#888', marginTop: 2 },
  clubCourts: { fontSize: 13, color: '#007AFF', marginTop: 2 },
  dateScroll: { marginBottom: 8 },
  dateButton: { padding: 10, borderRadius: 8, backgroundColor: '#fff', marginRight: 8, borderWidth: 2, borderColor: 'transparent', minWidth: 80, alignItems: 'center' },
  dateSelected: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
  dateText: { fontSize: 13, color: '#333', textAlign: 'center' },
  dateTextSelected: { color: '#fff', fontWeight: 'bold' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  timeButton: { padding: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent', minWidth: 70, alignItems: 'center' },
  timeSelected: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
  timeText: { fontSize: 14, color: '#333' },
  timeTextSelected: { color: '#fff', fontWeight: 'bold' },
  bookButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  bookButtonDisabled: { backgroundColor: '#aaa' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});