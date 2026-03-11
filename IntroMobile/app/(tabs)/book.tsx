import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { createBooking } from '../../src/firebase/firestore';
import { getClubs, getBookedSlots } from '../../src/firebase/matches';
import DateTimePicker from '@react-native-community/datetimepicker';

const TIME_SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'];

export default function BookScreen() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/login' as any);
    }
    const fetchClubs = async () => {
      const data = await getClubs();
      setClubs(data);
    };
    fetchClubs();
  }, [user]);

  useEffect(() => {
    if (selectedClub && selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedClub, selectedDate]);

  const fetchBookedSlots = async () => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const slots = await getBookedSlots(selectedClub.id, dateString);
    setBookedSlots(slots);
    setSelectedTime('');
  };

  const handleBooking = async () => {
    if (!selectedClub || !selectedTime) {
      Alert.alert('Fout', 'Selecteer een club, datum en tijdslot');
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        clubId: selectedClub.id,
        clubName: selectedClub.name,
        date: selectedDate.toISOString().split('T')[0],
        timeSlot: selectedTime,
        userId: user!.uid,
        userName: user!.name
      });
      Alert.alert('Gelukt!', `Boeking bevestigd voor ${selectedClub.name} op ${selectedDate.toLocaleDateString('nl-BE')} om ${selectedTime}`);
      setSelectedClub(null);
      setSelectedDate(new Date());
      setSelectedTime('');
      setBookedSlots([]);
    } catch (error) {
      Alert.alert('Fout', 'Boeking mislukt, probeer opnieuw');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Veld Boeken</Text>

      <Text style={styles.sectionTitle}>Kies een club</Text>
      {clubs.map((club) => (
        <TouchableOpacity
          key={club.id}
          style={[styles.card, selectedClub?.id === club.id && styles.cardSelected]}
          onPress={() => setSelectedClub(club)}
        >
          <View>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubAddress}>{club.address}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>Kies een datum</Text>
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

      <Text style={styles.sectionTitle}>Kies een tijdslot</Text>
      <View style={styles.timeGrid}>
        {TIME_SLOTS.map((time) => {
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
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: '#007AFF' },
  clubName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  clubAddress: { fontSize: 13, color: '#888', marginTop: 2 },
  dateButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 8, backgroundColor: '#fff' },
  dateText: { fontSize: 16, color: '#333' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  timeButton: { padding: 10, borderRadius: 8, backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent', minWidth: 70, alignItems: 'center' },
  timeSelected: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
  timeBooked: { backgroundColor: '#f0f0f0', borderColor: '#ddd' },
  timeText: { fontSize: 14, color: '#333' },
  timeTextSelected: { color: '#fff', fontWeight: 'bold' },
  timeTextBooked: { color: '#aaa' },
  bookButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 },
  bookButtonDisabled: { backgroundColor: '#aaa' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});