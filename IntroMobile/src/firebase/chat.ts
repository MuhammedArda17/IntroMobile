import { db } from './config';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  doc,
  getDoc
} from 'firebase/firestore';

export const sendMessage = async (matchId: string, message: {
  userId: string;
  userName: string;
  text: string;
}) => {
  await addDoc(collection(db, 'matches', matchId, 'messages'), {
    ...message,
    createdAt: Timestamp.now()
  });
};

export const subscribeToMessages = (
  matchId: string,
  callback: (messages: any[]) => void
) => {
  const q = query(
    collection(db, 'matches', matchId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

export const getMatchDetails = async (matchId: string) => {
  const docRef = doc(db, 'matches', matchId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};