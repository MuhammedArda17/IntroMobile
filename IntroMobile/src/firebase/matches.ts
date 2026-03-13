import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  Timestamp ,
} from 'firebase/firestore';



export const getClubs = async () => {
  const snapshot = await getDocs(collection(db, 'clubs'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getBookedSlots = async (clubId: string, date: string): Promise<string[]> => {
  const bookingsQuery = query(
    collection(db, 'bookings'),
    where('clubId', '==', clubId),
    where('date', '==', date)
  );
  const matchesQuery = query(
    collection(db, 'matches'),
    where('clubId', '==', clubId),
    where('date', '==', date)
  );

  const [bookingsSnap, matchesSnap] = await Promise.all([
    getDocs(bookingsQuery),
    getDocs(matchesQuery)
  ]);

  const bookedTimes = [
    ...bookingsSnap.docs.map(doc => doc.data().timeSlot),
    ...matchesSnap.docs.map(doc => doc.data().time)
  ];

  return bookedTimes;
};

export const createMatch = async (matchData: {
  creatorId: string;
  creatorName: string;
  clubId: string;
  clubName: string;
  date: Date;
  time: string;
  levelMin: number;
  levelMax: number;
  isMixed: boolean;
  isCompetitive: boolean;
  fieldId: string;
}) => {
  const dateString = matchData.date.toISOString().split('T')[0];

  const existingSlots = await getBookedSlots(matchData.clubId, dateString);
  if (existingSlots.includes(matchData.time)) {
    throw new Error('Dit tijdslot is al bezet');
  }

  const match = {
    ...matchData,
    date: dateString,
    players: [{
      uid: matchData.creatorId,
      name: matchData.creatorName,
    }],
    status: 'open',
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'matches'), match);
  return docRef.id;
};

export const getMatches = async () => {
  const snapshot = await getDocs(collection(db, 'matches'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFilteredMatches = async (filters: {
  levelMin?: number;
  levelMax?: number;
  date?: string;
  clubId?: string;
  isMixed?: boolean;
  isCompetitive?: boolean;
}) => {
  const snapshot = await getDocs(collection(db, 'matches'));
  let matches = snapshot.docs.map(doc => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.seconds 
      ? new Date(data.createdAt.seconds * 1000).toISOString()
      : null,
  };
}) as any[];

  matches = matches.filter(match => match.status === 'open');

  if (filters.date) {
    matches = matches.filter(match => match.date === filters.date);
  }
  if (filters.clubId) {
    matches = matches.filter(match => match.clubId === filters.clubId);
  }
  if (filters.isMixed !== undefined) {
    matches = matches.filter(match => match.isMixed === filters.isMixed);
  }
  if (filters.isCompetitive !== undefined) {
    matches = matches.filter(match => match.isCompetitive === filters.isCompetitive);
  }
  if (filters.levelMin !== undefined) {
    matches = matches.filter(match => match.levelMax >= filters.levelMin!);
  }
  if (filters.levelMax !== undefined) {
    matches = matches.filter(match => match.levelMin <= filters.levelMax!);
  }

  return matches;
};

export const joinMatch = async (matchId: string, user: { uid: string; name: string; level: number }) => {
  const matchRef = doc(db, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) throw new Error('Wedstrijd niet gevonden');

  const matchData = matchSnap.data();

  if (matchData.players.length >= 4) throw new Error('Wedstrijd is al vol');
  if (matchData.players.some((p: any) => p.uid === user.uid)) throw new Error('Je zit al in deze wedstrijd');
  if (user.level < matchData.levelMin || user.level > matchData.levelMax) {
    throw new Error(`Je niveau (${user.level}) past niet binnen de range ${matchData.levelMin}-${matchData.levelMax}`);
  }

  const updatedPlayers = [...matchData.players, { uid: user.uid, name: user.name }];
  const newStatus = updatedPlayers.length === 4 ? 'confirmed' : 'open';

  await updateDoc(matchRef, {
    players: updatedPlayers,
    status: newStatus,
  });
};