import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';

export const rewardService = {
  /**
   * Award Fit Points to user and record transaction in users/{userId}/rewards
   * Enforces duplicate protection per action per day
   */
  async awardPoints(userId, actionType, points = 10, metadata = {}) {
    if (!userId) return null;

    const todayDate = new Date().toISOString().split('T')[0];
    const dedupeKey = `${actionType}_${todayDate}`;

    if (!isFirebaseConfigured) {
      const currentPts = Number(localStorage.getItem('snapfit_fit_points') || 650);
      const updatedPts = currentPts + points;
      localStorage.setItem('snapfit_fit_points', updatedPts.toString());
      return { fitPoints: updatedPts, awarded: points };
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return null;
      const userData = userSnap.data();

      // Check daily dedupe map if needed
      const rewardedActions = userData.rewardedActionsToday || [];
      if (actionType !== 'meal_log' && rewardedActions.includes(dedupeKey)) {
        // Already awarded for this action today
        return { fitPoints: userData.fitPoints || 0, awarded: 0, duplicate: true };
      }

      const currentPoints = Number(userData.fitPoints) || 0;
      const newPoints = currentPoints + points;

      // Update user doc
      await updateDoc(userRef, {
        fitPoints: newPoints,
        rewardedActionsToday: [...rewardedActions, dedupeKey],
        updatedAt: serverTimestamp()
      });

      // Record in rewards subcollection
      const rewardsSubRef = collection(db, 'users', userId, 'rewards');
      await addDoc(rewardsSubRef, {
        action: actionType,
        pointsAwarded: points,
        totalPointsNow: newPoints,
        date: todayDate,
        description: metadata.description || `Earned +${points} Fit Points for ${actionType}`,
        createdAt: serverTimestamp()
      });

      return { fitPoints: newPoints, awarded: points };
    } catch (err) {
      console.warn('Error awarding fit points in Firestore:', err.message);
      return null;
    }
  },

  /**
   * Update or increment daily streak if active on consecutive days
   */
  async updateDailyStreak(userId) {
    if (!userId) return 1;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (!isFirebaseConfigured) {
      return Number(localStorage.getItem('snapfit_streak_days') || 5);
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) return 1;
      const data = userSnap.data();

      const lastActive = data.lastActiveDate || '';
      let streak = Number(data.streakDays) || 1;

      if (lastActive === todayStr) {
        // Already counted today
        return streak;
      } else if (lastActive === yesterdayStr) {
        // Consecutive day streak increment!
        streak += 1;
      } else if (lastActive && lastActive < yesterdayStr) {
        // Missed a day: reset streak to 1
        streak = 1;
      }

      await updateDoc(userRef, {
        streakDays: streak,
        lastActiveDate: todayStr,
        updatedAt: serverTimestamp()
      });

      return streak;
    } catch (err) {
      console.warn('Error calculating streak:', err.message);
      return 1;
    }
  },

  /**
   * Real-time listener for user points and streak
   */
  subscribeToRewards(userId, callback) {
    if (!userId) {
      callback({ fitPoints: 650, streakDays: 5, redeemedRewards: [] });
      return () => {};
    }

    if (!isFirebaseConfigured) {
      const load = () => {
        const pts = Number(localStorage.getItem('snapfit_fit_points') || 650);
        const streak = Number(localStorage.getItem('snapfit_streak_days') || 5);
        const redeemed = JSON.parse(localStorage.getItem('snapfit_redeemed_rewards') || '[]');
        callback({ fitPoints: pts, streakDays: streak, redeemedRewards: redeemed });
      };
      load();
      window.addEventListener('storage', load);
      return () => window.removeEventListener('storage', load);
    }

    const userRef = doc(db, 'users', userId);
    return onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          callback({
            fitPoints: Number(data.fitPoints) || 0,
            streakDays: Number(data.streakDays) || 1,
            level: Math.floor((Number(data.fitPoints) || 0) / 250) + 1,
            redeemedRewards: data.redeemedRewards || []
          });
        }
      },
      (err) => {
        console.warn('Rewards onSnapshot error:', err.message);
      }
    );
  }
};
