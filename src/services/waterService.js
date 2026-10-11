import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

export const waterService = {
  /**
   * Log water intake in users/{userId}/water
   * Document structure:
   * {
   *   amountMl: number,
   *   source: "manual" | "chat",
   *   date: "YYYY-MM-DD",
   *   createdAt: timestamp
   * }
   */
  async logWater(userId, amountMl, source = 'manual') {
    if (!userId) throw new Error('User ID is required to log water.');

    const amount = Math.max(1, Number(amountMl) || 250);
    const todayDate = new Date().toLocaleDateString('en-CA');

    const waterDoc = {
      amountMl: amount,
      source: source === 'chat' ? 'chat' : 'manual',
      date: todayDate,
      createdAt: serverTimestamp()
    };

    if (!isFirebaseConfigured || !db) {
      const saved = JSON.parse(localStorage.getItem('snapfit_water_logs') || '[]');
      const newEntry = {
        id: `w-${Date.now()}`,
        ...waterDoc,
        createdAt: new Date().toISOString()
      };
      const updated = [newEntry, ...saved];
      localStorage.setItem('snapfit_water_logs', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      return newEntry;
    }

    const waterRef = collection(db, 'users', userId, 'water');
    const docRef = await addDoc(waterRef, waterDoc);
    return { id: docRef.id, ...waterDoc };
  },

  /**
   * Real-time listener for today's water entries in users/{userId}/water
   * Automatically calculates total ml for the current day
   */
  subscribeToTodayWater(userId, callback) {
    if (!userId) {
      callback(0, []);
      return () => {};
    }

    const todayDate = new Date().toLocaleDateString('en-CA');

    if (!isFirebaseConfigured || !db) {
      const load = () => {
        const saved = JSON.parse(localStorage.getItem('snapfit_water_logs') || '[]');
        const todayEntries = saved.filter((w) => !w.date || w.date === todayDate);
        const total = todayEntries.reduce((sum, item) => sum + (Number(item.amountMl) || 0), 0);
        callback(total, todayEntries);
      };
      load();
      window.addEventListener('storage', load);
      return () => window.removeEventListener('storage', load);
    }

    const waterRef = collection(db, 'users', userId, 'water');
    const q = query(waterRef, where('date', '==', todayDate));

    return onSnapshot(
      q,
      (snapshot) => {
        let totalMl = 0;
        const entries = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const ml = Number(data.amountMl) || 0;
          totalMl += ml;
          return {
            id: docSnap.id,
            amountMl: ml,
            source: data.source || 'manual',
            date: data.date || todayDate,
            createdAt: data.createdAt?.toDate?.() || new Date()
          };
        });
        callback(totalMl, entries);
      },
      (error) => {
        console.warn('Water onSnapshot notice:', error.message);
        const saved = JSON.parse(localStorage.getItem('snapfit_water_logs') || '[]');
        const todayEntries = saved.filter((w) => !w.date || w.date === todayDate);
        const total = todayEntries.reduce((sum, item) => sum + (Number(item.amountMl) || 0), 0);
        callback(total, todayEntries);
      }
    );
  }
};
