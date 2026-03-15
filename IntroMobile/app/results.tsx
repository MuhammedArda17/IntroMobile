import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, TextInput, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/useAuthStore';
import { getConfirmedMatches, submitMatchResult, updatePlayerLevels } from '../src/firebase/matches';
import { calculateNewLevels, getMatchWinner, isValidSet } from '../src/utils/levelAlgorithm';
import { getUserData } from '../src/firebase/auth';

export default function ResultsScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [sets, setSets] = useState([
    { team1: '', team2: '' },
    { team1: '', team2: '' },
    { team1: '', team2: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await getConfirmedMatches(user!.uid);
      setMatches(data);
    } catch (error) {
      Alert.alert('Fout', 'Kon wedstrijden niet laden');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMatch) return;

    const filledSets = sets.filter(s => s.team1 !== '' && s.team2 !== '');
    if (filledSets.length < 2) {
      Alert.alert('Fout', 'Voer minstens 2 sets in');
      return;
    }

    const parsedSets = filledSets.map(s => ({
      team1: parseInt(s.team1),
      team2: parseInt(s.team2),
    }));

    for (const set of parsedSets) {
      if (!isValidSet(set.team1, set.team2)) {
        Alert.alert('Fout', `Ongeldige set score: ${set.team1}-${set.team2}`);
        return;
      }
    }

    const winner = getMatchWinner(parsedSets);
    if (!winner) {
      Alert.alert('Fout', 'Kon winnaar niet bepalen, controleer de scores');
      return;
    }

    setSubmitting(true);
    try {
      await submitMatchResult(selectedMatch.id, parsedSets, winner);

      if (selectedMatch.isCompetitive) {
        const players = selectedMatch.players;
        const team1 = [players[0], players[1]];
        const team2 = [players[2], players[3]];

        const team1Data = await Promise.all(team1.map((p: any) => getUserData(p.uid)));
        const team2Data = await Promise.all(team2.map((p: any) => getUserData(p.uid)));

        const team1Levels = team1Data.map((p: any) => p?.level ?? 1.5);
        const team2Levels = team2Data.map((p: any) => p?.level ?? 1.5);

        const { newWinnerLevels, newLoserLevels } = winner === 'team1'
          ? calculateNewLevels(team1Levels, team2Levels)
          : calculateNewLevels(team2Levels, team1Levels);

        const winnerPlayers = winner === 'team1' ? team1 : team2;
        const loserPlayers = winner === 'team1' ? team2 : team1;

        await updatePlayerLevels([
          ...winnerPlayers.map((p: any, i: number) => ({ uid: p.uid, newLevel: newWinnerLevels[i] })),
          ...loserPlayers.map((p: any, i: number) => ({ uid: p.uid, newLevel: newLoserLevels[i] })),
        ]);

        const updatedUser = await getUserData(user!.uid);
        setUser(updatedUser as any);

        Alert.alert('Succes', `Resultaat opgeslagen! Levels zijn aangepast.`);
      } else {
        Alert.alert('Succes', 'Resultaat opgeslagen!');
      }

      setSelectedMatch(null);
      setSets([{ team1: '', team2: '' }, { team1: '', team2: '' }, { team1: '', team2: '' }]);
      fetchMatches();
    } catch (error: any) {
      Alert.alert('Fout', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resultaten invoeren</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : matches.length === 0 ? (
        <Text style={styles.noResults}>Geen bevestigde wedstrijden gevonden</Text>
      ) : (
        matches.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={[styles.matchCard, selectedMatch?.id === match.id && styles.matchCardSelected]}
            onPress={() => setSelectedMatch(selectedMatch?.id === match.id ? null : match)}
          >
            <Text style={styles.matchClub}>{match.clubName}</Text>
        <Text style={styles.matchInfo}>📅 {typeof match.date === 'string' ? match.date : new Date(match.date?.seconds * 1000).toLocaleDateString('nl-BE')} om {match.time}</Text>
            <Text style={styles.matchInfo}>
              {match.isCompetitive ? '🏆 Competitief' : '🎮 Vriendschappelijk'}
            </Text>
            <View style={styles.playersRow}>
              {match.players.map((p: any, i: number) => (
                <View key={i} style={[styles.playerSlot, i < 2 ? styles.team1 : styles.team2]}>
                  <Text style={styles.playerName}>{p.name}</Text>
                  <Text style={styles.teamLabel}>{i < 2 ? 'Team 1' : 'Team 2'}</Text>
                </View>
              ))}
            </View>

            {selectedMatch?.id === match.id && (
              <View style={styles.scoreForm}>
                <Text style={styles.scoreTitle}>Scores invoeren</Text>
                <View style={styles.scoreHeader}>
                  <Text style={styles.scoreHeaderText}>Team 1</Text>
                  <Text style={styles.scoreHeaderText}>Team 2</Text>
                </View>
                {sets.map((set, index) => (
                  <View key={index} style={styles.setRow}>
                    <Text style={styles.setLabel}>Set {index + 1}</Text>
                    <TextInput
                      style={styles.scoreInput}
                      value={set.team1}
                      onChangeText={(text) => {
                        const newSets = [...sets];
                        newSets[index].team1 = text;
                        setSets(newSets);
                      }}
                      keyboardType="numeric"
                      maxLength={1}
                      placeholder="0"
                    />
                    <Text style={styles.scoreDash}>-</Text>
                    <TextInput
                      style={styles.scoreInput}
                      value={set.team2}
                      onChangeText={(text) => {
                        const newSets = [...sets];
                        newSets[index].team2 = text;
                        setSets(newSets);
                      }}
                      keyboardType="numeric"
                      maxLength={1}
                      placeholder="0"
                    />
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  <Text style={styles.submitButtonText}>
                    {submitting ? 'Bezig...' : 'Resultaat opslaan'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  noResults: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 16 },
  matchCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  matchCardSelected: { borderColor: '#007AFF' },
  matchClub: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  matchInfo: { fontSize: 14, color: '#555', marginBottom: 4 },
  playersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  playerSlot: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center', minWidth: '45%' },
  team1: { backgroundColor: '#e8f4ff' },
  team2: { backgroundColor: '#fff3e0' },
  playerName: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  teamLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  scoreForm: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  scoreTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  scoreHeaderText: { fontSize: 14, fontWeight: '600', color: '#555', flex: 1, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'center', gap: 12 },
  setLabel: { fontSize: 14, color: '#555', width: 45 },
  scoreInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 18, width: 50, textAlign: 'center', backgroundColor: '#fff' },
  scoreDash: { fontSize: 18, color: '#333' },
  submitButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { backgroundColor: '#aaa' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});