import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TextInput
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../src/firebase/config';

export default function LeaderboardScreen() {
  const user = useAuthStore((state) => state.user);
  const [players, setPlayers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('level', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          rank: index + 1,
          ...doc.data()
        }));
        setPlayers(data);
        setFiltered(data);
      } catch (error) {
        console.error('Fout bij ophalen leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === '') {
      setFiltered(players);
    } else {
      setFiltered(players.filter(p => 
        p.name.toLowerCase().includes(text.toLowerCase())
      ));
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const renderPlayer = ({ item }: { item: any }) => {
    const isMe = item.id === user?.uid;
    return (
      <View style={[styles.playerCard, isMe && styles.playerCardMe]}>
        <Text style={styles.rank}>{getRankEmoji(item.rank)}</Text>
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, isMe && styles.playerNameMe]}>
            {item.name} {isMe && '(jij)'}
          </Text>
          <Text style={styles.playerGender}>{item.gender}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{item.level}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <Text style={styles.subtitle}>Gesorteerd op niveau</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Zoek een speler..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <Text style={styles.noResults}>Geen spelers gevonden</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4, color: '#333' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  searchBar: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#eee', marginBottom: 16 },
  list: { paddingBottom: 40 },
  noResults: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  playerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  playerCardMe: { borderColor: '#007AFF', backgroundColor: '#e8f4ff' },
  rank: { fontSize: 22, width: 50, textAlign: 'center' },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  playerNameMe: { color: '#007AFF' },
  playerGender: { fontSize: 13, color: '#888', marginTop: 2 },
  levelBadge: { backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  levelText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});