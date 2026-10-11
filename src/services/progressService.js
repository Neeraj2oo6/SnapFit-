import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

export const progressService = {
  /**
   * Log a new weight progress checkpoint in users/{userId}/progress
   */
  async logWeightProgress(userId, weightKg) {
    if (!userId) throw new Error('User ID is required.');
    const todayDate = new Date().toISOString().split('T')[0];

    const data = {
      weight: parseFloat(weightKg),
      date: todayDate,
      createdAt: serverTimestamp()
    };

    if (!isFirebaseConfigured) {
      const saved = JSON.parse(localStorage.getItem('snapfit_weight_history') || '[]');
      localStorage.setItem('snapfit_weight_history', JSON.stringify([data, ...saved]));
      return data;
    }

    const progressRef = collection(db, 'users', userId, 'progress');
    const docRef = await addDoc(progressRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Fetch real historical nutrition & activity data for 7-day, 30-day, or monthly ranges
   * Aggregates real meals, water, and activities from Firestore
   */
  async getHistoricalProgress(userId, days = 7) {
    if (!userId) return [];

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const datesMap = {};

    // Prepare chronological date map for requested number of days
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = dayLabels[d.getDay()];

      datesMap[isoDate] = {
        date: isoDate,
        day: dayName,
        calories: 0,
        targetCalories: 2200,
        protein: 0,
        carbs: 0,
        fat: 0,
        waterLiters: 0,
        steps: 0,
        activityMinutes: 0
      };
    }

    const minDate = Object.keys(datesMap)[0];

    if (!isFirebaseConfigured) {
      // Return structured map based on stored local meals
      const savedMeals = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
      savedMeals.forEach((m) => {
        const d = m.date || new Date().toISOString().split('T')[0];
        if (datesMap[d]) {
          datesMap[d].calories += Number(m.calories) || 0;
          datesMap[d].protein += Number(m.protein) || 0;
          datesMap[d].carbs += Number(m.carbs) || 0;
          datesMap[d].fat += Number(m.fat) || 0;
        }
      });
      return Object.values(datesMap);
    }

    try {
      // 1. Query Meals in date range
      const mealsRef = collection(db, 'users', userId, 'meals');
      const mealsQuery = query(mealsRef, where('date', '>=', minDate));
      const mealDocs = await getDocs(mealsQuery);

      mealDocs.forEach((docSnap) => {
        const data = docSnap.data();
        const d = data.date;
        if (datesMap[d]) {
          datesMap[d].calories += Number(data.calories) || 0;
          datesMap[d].protein += Number(data.protein) || 0;
          datesMap[d].carbs += Number(data.carbs) || 0;
          datesMap[d].fat += Number(data.fat) || 0;
        }
      });

      // 2. Query Water in date range
      const waterRef = collection(db, 'users', userId, 'water');
      const waterQuery = query(waterRef, where('date', '>=', minDate));
      const waterDocs = await getDocs(waterQuery);

      waterDocs.forEach((docSnap) => {
        const data = docSnap.data();
        const d = data.date;
        if (datesMap[d]) {
          datesMap[d].waterLiters = Number(((datesMap[d].waterLiters || 0) + (Number(data.amountMl) || 0) / 1000).toFixed(1));
        }
      });

      // 3. Query Activities in date range
      const actRef = collection(db, 'users', userId, 'activities');
      const actQuery = query(actRef, where('date', '>=', minDate));
      const actDocs = await getDocs(actQuery);

      actDocs.forEach((docSnap) => {
        const data = docSnap.data();
        const d = data.date;
        if (datesMap[d]) {
          datesMap[d].steps += Number(data.steps) || 0;
          datesMap[d].activityMinutes += Number(data.duration) || 0;
        }
      });

      return Object.values(datesMap);
    } catch (err) {
      console.warn('Error aggregating Firestore historical progress:', err.message);
      return Object.values(datesMap);
    }
  }
};
