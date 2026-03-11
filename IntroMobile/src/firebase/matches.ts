import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs,
  query,
  where,
  Timestamp 
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