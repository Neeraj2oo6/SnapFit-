import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

/**
 * Calculates approximate calorie burn for common activity types based on duration
 */
export const estimateActivityCalories = (type = 'Workout', minutes = 30) => {
  const duration = Number(minutes) || 30;
  const ratesPerMinute = {
    'Walking': 4.5,
    'Running': 11.5,
    'Cycling': 8.0,
    'Gym': 7.0,
    'Workout': 8.0,
    'Steps': 0.04
  };
  const rate = ratesPerMinute[type] || 6.5;
  return Math.round(duration * rate);
};

export const activityService = {
  /**
   * Log an activity to users/{userId}/activities
   */
  async logActivity(userId, activity) {
    if (!userId) throw new Error('User ID is required to log activity.');

    const duration = Number(activity.duration) || 30;
    const activityType = activity.activityType || activity.type || 'Workout';
    const caloriesBurned = Number(activity.caloriesBurned) || estimateActivityCalories(activityType, duration);
    const steps = Number(activity.steps) || (activityType === 'Walking' ? duration * 100 : activityType === 'Running' ? duration * 160 : 0);
    const todayDate = new Date().toISOString().split('T')[0];

    const activityDoc = {
      activityType,
      duration,
      caloriesBurned,
      steps,
      notes: activity.notes || '',
      date: activity.date || todayDate,
      createdAt: serverTimestamp()
    };

    if (!isFirebaseConfigured) {
      const saved = JSON.parse(localStorage.getItem('snapfit_activities') || '[]');
      const newAct = { id: `act-${Date.now()}`, ...activityDoc, createdAt: new Date().toISOString() };
      localStorage.setItem('snapfit_activities', JSON.stringify([newAct, ...saved]));
      return newAct;
    }

    const actRef = collection(db, 'users', userId, 'activities');
    const docRef = await addDoc(actRef, activityDoc);
    return { id: docRef.id, ...activityDoc };
  },

  /**
   * Real-time listener for today's activities in users/{userId}/activities
   */
  subscribeToTodayActivities(userId, callback) {
    if (!userId) {
      callback({ totalMinutes: 0, totalCaloriesBurned: 0, totalSteps: 0, activities: [] });
      return () => {};
    }

    const todayDate = new Date().toISOString().split('T')[0];

    if (!isFirebaseConfigured) {
      const load = () => {
        const saved = JSON.parse(localStorage.getItem('snapfit_activities') || '[]');
        const today = saved.filter((a) => !a.date || a.date === todayDate);
        const totals = today.reduce(
          (acc, a) => {
            acc.totalMinutes += Number(a.duration) || 0;
            acc.totalCaloriesBurned += Number(a.caloriesBurned) || 0;
            acc.totalSteps += Number(a.steps) || 0;
            return acc;
          },
          { totalMinutes: 30, totalCaloriesBurned: 220, totalSteps: 4200 }
        );
        callback({ ...totals, activities: today });
      };
      load();
      window.addEventListener('storage', load);
      return () => window.removeEventListener('storage', load);
    }

    const actRef = collection(db, 'users', userId, 'activities');
    const q = query(actRef, where('date', '==', todayDate));

    return onSnapshot(
      q,
      (snapshot) => {
        let totalMinutes = 0;
        let totalCaloriesBurned = 0;
        let totalSteps = 0;

        const activities = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const dur = Number(data.duration) || 0;
          const cal = Number(data.caloriesBurned) || 0;
          const stp = Number(data.steps) || 0;

          totalMinutes += dur;
          totalCaloriesBurned += cal;
          totalSteps += stp;

          return {
            id: docSnap.id,
            activityType: data.activityType || 'Workout',
            duration: dur,
            caloriesBurned: cal,
            steps: stp,
            date: data.date,
            createdAt: data.createdAt?.toDate?.() || new Date()
          };
        });

        callback({
          totalMinutes,
          totalCaloriesBurned,
          totalSteps,
          activities
        });
      },
      (error) => {
        console.warn('Activity onSnapshot error, falling back:', error.message);
        callback({ totalMinutes: 0, totalCaloriesBurned: 0, totalSteps: 0, activities: [] });
      }
    );
  }
};
