import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';


export const getClubs = async () => {
  const querySnapshot = await getDocs(collection(db, 'clubs'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


export const getTimeSlots = async (clubId: string, date: string) => {
  const q = query(
    collection(db, 'timeslots'),
    where('clubId', '==', clubId),
    where('date', '==', date),
    where('available', '==', true)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


export const createBooking = async (bookingData: {
  clubId: string;
  clubName: string;
  date: string;
  timeSlot: string;
  userId: string;
  userName: string;
}) => {
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
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};