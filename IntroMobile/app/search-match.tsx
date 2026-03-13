import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { getFilteredMatches, getClubs, joinMatch } from '../src/firebase/matches';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SearchMatchScreen() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const [matches, setMatches] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterClub, setFilterClub] = useState<string>('');
  const [filterMixed, setFilterMixed] = useState<boolean | undefined>(undefined);
  const [filterCompetitive, setFilterCompetitive] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getClubs().then(setClubs);
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (filterDate) filters.date = filterDate.toISOString().split('T')[0];
      if (filterClub) filters.clubId = filterClub;
      if (filterMixed !== undefined) filters.isMixed = filterMixed;
      if (filterCompetitive !== undefined) filters.isCompetitive = filterCompetitive;
      filters.levelMin = user?.level;
      filters.levelMax = user?.level;

      const data = await getFilteredMatches(filters);
      setMatches(data);
    } catch (error) {
      Alert.alert('Fout', 'Kon wedstrijden niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (matchId: string) => {
    setJoining(matchId);
    try {
      await joinMatch(matchId, {
        uid: user!.uid,
        name: user!.name,
        level: user!.level,
      });
      Alert.alert('Succes', 'Je hebt je ingeschreven!');
      fetchMatches();
    } catch (error: any) {
      Alert.alert('Fout', error.message);
    } finally {
      setJoining(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wedstrijd zoeken</Text>

      <Text style={styles.sectionTitle}>Filters</Text>

      <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          {filterDate ? filterDate.toLocaleDateString('nl-BE') : 'Alle datums'}
        </Text>
      </TouchableOpacity>
      {filterDate && (
        <TouchableOpacity onPress={() => setFilterDate(null)}>
          <Text style={styles.clearFilter}>Datum wissen</Text>
        </TouchableOpacity>
      )}
      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          minimumDate={new Date()}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setFilterDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Club</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <TouchableOpacity
          style={[styles.filterChip, filterClub === '' && styles.filterChipSelected]}
          onPress={() => setFilterClub('')}
        >
          <Text style={[styles.filterChipText, filterClub === '' && styles.filterChipTextSelected]}>Alle</Text>
        </TouchableOpacity>
        {clubs.map((club) => (
          <TouchableOpacity
            key={club.id}
            style={[styles.filterChip, filterClub === club.id && styles.filterChipSelected]}
            onPress={() => setFilterClub(club.id)}
          >
            <Text style={[styles.filterChipText, filterClub === club.id && styles.filterChipTextSelected]}>
              {club.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Gemengd</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, filterMixed === false && styles.toggleSelected]}
          onPress={() => setFilterMixed(false)}
        >
          <Text style={[styles.toggleText, filterMixed === false && styles.toggleTextSelected]}>Nee</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, filterMixed === true && styles.toggleSelected]}
          onPress={() => setFilterMixed(true)}
        >
          <Text style={[styles.toggleText, filterMixed === true && styles.toggleTextSelected]}>Ja</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Competitief</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, filterCompetitive === false && styles.toggleSelected]}
          onPress={() => setFilterCompetitive(false)}
        >
          <Text style={[styles.toggleText, filterCompetitive === false && styles.toggleTextSelected]}>Nee</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, filterCompetitive === true && styles.toggleSelected]}
          onPress={() => setFilterCompetitive(true)}
        >
          <Text style={[styles.toggleText, filterCompetitive === true && styles.toggleTextSelected]}>Ja</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.searchButton} onPress={fetchMatches}>
        <Text style={styles.searchButtonText}>Zoeken</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Resultaten</Text>
      <Text style={styles.levelInfo}>Jouw niveau: {user?.level} — toont wedstrijden binnen jouw bereik</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : matches.length === 0 ? (
        <Text style={styles.noResults}>Geen wedstrijden gevonden</Text>
      ) : (
        matches.map((match) => (
          <View key={match.id} style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchClub}>{match.clubName}</Text>
              <Text style={styles.matchStatus}>{match.players.length}/4 spelers</Text>
            </View>
            <Text style={styles.matchInfo}>📅 {typeof match.date === 'string' ? match.date : new Date(match.date?.seconds * 1000).toLocaleDateString('nl-BE')} om {match.time}</Text>
            <Text style={styles.matchInfo}>📊 Niveau: {match.levelMin} - {match.levelMax}</Text>
            <Text style={styles.matchInfo}>
              {match.isMixed ? '👥 Gemengd' : '👥 Niet gemengd'} · {match.isCompetitive ? '🏆 Competitief' : '🎮 Vriendschappelijk'}
            </Text>
            <View style={styles.playersRow}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={[styles.playerSlot, match.players[i] && styles.playerSlotFilled]}>
                  <Text style={styles.playerName}>
                    {match.players[i] ? match.players[i].name : '+'}
                  </Text>
                </View>
              ))}
            </View>
            {match.creatorId === user?.uid ? (
  <View style={styles.ownerBadge}>
    <Text style={styles.ownerText}>🏓 Jouw wedstrijd</Text>
  </View>
) : !match.players.some((p: any) => p.uid === user?.uid) ? (
  <TouchableOpacity
    style={[styles.joinButton, joining === match.id && styles.joinButtonDisabled]}
    onPress={() => handleJoin(match.id)}
    disabled={joining === match.id}
  >
    <Text style={styles.joinButtonText}>
      {joining === match.id ? 'Bezig...' : 'Inschrijven'}
    </Text>
  </TouchableOpacity>
) : (
  <View style={styles.joinedBadge}>
    <Text style={styles.joinedText}>✅ Je bent ingeschreven</Text>
  </View>
)}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 12, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  levelInfo: { fontSize: 13, color: '#888', marginBottom: 12 },
  dateButton: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 4, backgroundColor: '#fff' },
  dateText: { fontSize: 16, color: '#333' },
  clearFilter: { color: '#FF3B30', fontSize: 13, marginBottom: 8 },
  horizontalScroll: { marginBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 8, backgroundColor: '#fff' },
  filterChipSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  filterChipText: { fontSize: 14, color: '#333' },
  filterChipTextSelected: { color: '#fff', fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  toggleButton: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#fff' },
  toggleSelected: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  toggleText: { fontSize: 14, color: '#333' },
  toggleTextSelected: { color: '#fff', fontWeight: 'bold' },
  searchButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noResults: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 16 },
  matchCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matchClub: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  matchStatus: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
  matchInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  playersRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 12 },
  playerSlot: { flex: 1, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', backgroundColor: '#f9f9f9' },
  playerSlotFilled: { backgroundColor: '#e8f4ff', borderColor: '#007AFF' },
  ownerBadge: { backgroundColor: '#fff3e0', padding: 10, borderRadius: 8, alignItems: 'center' },
  ownerText: { color: '#ff9500', fontWeight: '600' },
  playerName: { fontSize: 12, color: '#333', textAlign: 'center' },
  joinButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  joinButtonDisabled: { backgroundColor: '#aaa' },
  joinButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  joinedBadge: { backgroundColor: '#e8f4ff', padding: 10, borderRadius: 8, alignItems: 'center' },
  joinedText: { color: '#007AFF', fontWeight: '600' },
});