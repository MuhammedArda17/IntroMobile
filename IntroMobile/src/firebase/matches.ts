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
  const match = {
    ...matchData,
    date: Timestamp.fromDate(matchData.date),
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