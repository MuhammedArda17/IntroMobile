import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';

const ALL_TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00'];

export const getClubs = async () => {
  const snapshot = await getDocs(collection(db, 'clubs'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getAvailableTimeSlots = async (clubId: string, date: string) => {
  const q = query(
    collection(db, 'bookings'),
    where('clubId', '==', clubId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  const bookedTimes = snapshot.docs.map(doc => doc.data().time);
  return ALL_TIMES.filter(time => !bookedTimes.includes(time));
};

export const createBooking = async (bookingData: {
  clubId: string;
  clubName: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  type: 'booking' | 'match';
}) => {
  const q = query(
    collection(db, 'bookings'),
    where('clubId', '==', bookingData.clubId),
    where('date', '==', bookingData.date),
    where('time', '==', bookingData.time)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    throw new Error('Dit tijdslot is al bezet');
  }

  const docRef = await addDoc(collection(db, 'bookings'), {
    ...bookingData,
    createdAt: Timestamp.now(),
    status: 'confirmed'
  });
  return docRef.id;
};

export const getUserBookings = async (userId: string) => {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};