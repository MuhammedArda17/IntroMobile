import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { logoutUser } from '../../src/firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/firebase/config';

const BG_IMAGE = { uri: 'https://www.datocms-assets.com/115107/1715858196-503131f0-5713-41e5-8935-56eea0f5fefb-1.jpg?auto=compress&crop=focalpoint&dpr=1.65&fit=crop&fm=webp&h=500&q=85&w=612' };

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Uitloggen', 'Weet je zeker dat je wil uitloggen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Uitloggen',
        style: 'destructive',
        onPress: async () => {
          await logoutUser();
          setUser(null);
          router.replace('/login' as any);
        }
      }
    ]);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Toestemming nodig', 'We hebben toegang nodig tot je fotobibliotheek');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setUploading(true);
      try {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        
        // Opslaan in Firestore
        await updateDoc(doc(db, 'users', user!.uid), {
          photoURL: base64Image
        });

        // Update local store
        setUser({ ...user!, photoURL: base64Image } as any);
        Alert.alert('Gelukt!', 'Profielfoto bijgewerkt!');
      } catch (error) {
        Alert.alert('Fout', 'Kon foto niet opslaan');
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={BG_IMAGE} style={styles.header} resizeMode="cover">
        <View style={styles.headerOverlay} />
        <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
          {(user as any)?.photoURL ? (
            <Image
              source={{ uri: (user as any).photoURL }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Text style={styles.editBadgeText}>{uploading ? '⏳' : '📷'}</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </ImageBackground>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Niveau</Text>
          <Text style={styles.infoValue}>{user?.level}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Geslacht</Text>
          <Text style={styles.infoValue}>{user?.gender}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Uitloggen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { height: 280, padding: 32, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 32 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  avatarImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)' },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  editBadge: { position: 'absolute', bottom: 12, right: -4, backgroundColor: '#fff', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  editBadgeText: { fontSize: 12 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, margin: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 15, color: '#888' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee' },
  logoutButton: { backgroundColor: '#FF3B30', margin: 16, padding: 16, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});