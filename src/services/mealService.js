import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { nutritionService } from './nutritionService';

export const mealService = {
  /**
   * Add a new meal to users/{userId}/meals
   * Each meal document structure:
   * {
   *   foodName,
   *   portion,
   *   calories,
   *   protein,
   *   carbs,
   *   fat,
   *   source, // "camera" | "chat" | "manual"
   *   imageUrl,
   *   mealType,
   *   date, // YYYY-MM-DD
   *   createdAt
   * }
   */
  async addMeal(userId, meal) {
    if (!userId) throw new Error('User ID is required to save a meal.');

    const now = new Date();
    const todayDate = now.toLocaleDateString('en-CA'); // Guaranteed YYYY-MM-DD in local time
    const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Standardize nutrition source & input method
    const inputMethod = meal.inputMethod || meal.method || meal.source || 'voice';
    let source = meal.source;
    if (!source || source === 'camera' || source === 'chat' || source === 'manual' || source === 'voice') {
      source = (meal.isEstimated || meal.estimated) ? 'ai_estimate' : 'user_confirmed';
    }
    const estimated = meal.estimated !== undefined ? meal.estimated : (meal.isEstimated || false);
    const originalTranscript = meal.originalTranscript || meal.transcript || null;
    const quantity = Number(meal.quantity) || 1;
    const portionUnit = meal.portionUnit || (meal.portion ? String(meal.portion).replace(/^[\d.]+\s*/, '') : 'serving');

    const mealDoc = {
      foodName: meal.foodName || meal.name || 'Meal Log',
      name: meal.foodName || meal.name || 'Meal Log',
      quantity,
      portionUnit,
      portion: meal.portion || `${quantity} ${portionUnit}`,
      calories: Math.round(Number(meal.calories) || 0),
      protein: Math.round(Number(meal.protein) || 0),
      carbs: Math.round(Number(meal.carbs) || 0),
      fat: Math.round(Number(meal.fat) || 0),
      fiber: meal.fiber != null ? Math.round(Number(meal.fiber) * 10) / 10 : 0,
      sugar: meal.sugar != null ? Math.round(Number(meal.sugar) * 10) / 10 : 0,
      sodium: meal.sodium != null ? Math.round(Number(meal.sodium)) : 0,
      ...(meal.confidence != null && { confidence: Math.round(Number(meal.confidence)) }),
      source,
      estimated,
      inputMethod,
      originalTranscript,
      items: Array.isArray(meal.items) ? meal.items : null,
      imageUrl: meal.imageUrl || meal.image || null,
      mealType: meal.mealType || meal.type || 'Lunch',
      type: meal.mealType || meal.type || 'Lunch',
      date: meal.date || todayDate,
      time: meal.time || currentTime,
      createdAt: serverTimestamp()
    };

    // Cache confirmed food in shared Firestore foodDatabase
    nutritionService.cacheFoodInDatabase(mealDoc.foodName, mealDoc).catch(() => {});

    if (!isFirebaseConfigured || !db) {
      // Defensive local storage mode
      const saved = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
      const newMeal = {
        id: `m-${Date.now()}`,
        ...mealDoc,
        createdAt: new Date().toISOString()
      };
      const updated = [newMeal, ...saved];
      localStorage.setItem('snapfit_meals', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      return newMeal;
    }

    const mealsRef = collection(db, 'users', userId, 'meals');
    const docRef = await addDoc(mealsRef, mealDoc);
    return { id: docRef.id, ...mealDoc };
  },

  /**
   * One-time fetch of meals for user
   */
  async getMeals(userId) {
    if (!userId) return [];
    if (!isFirebaseConfigured || !db) {
      return JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
    }
    const mealsRef = collection(db, 'users', userId, 'meals');
    const snap = await getDocs(mealsRef);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /**
   * Universal meal subscriber alias
   */
  subscribeToMeals(userId, callback) {
    return this.subscribeToAllMeals(userId, callback);
  },

  /**
   * Update an existing meal in users/{userId}/meals/{mealId}
   */
  async updateMeal(userId, mealId, updatedData) {
    if (!userId || !mealId) throw new Error('User ID and Meal ID are required.');

    const name = updatedData.foodName || updatedData.name;
    const type = updatedData.mealType || updatedData.type;
    const img = updatedData.imageUrl !== undefined ? updatedData.imageUrl : updatedData.image;

    const updateFields = {
      ...(name && { foodName: name, name }),
      ...(type && { mealType: type, type }),
      ...(updatedData.calories !== undefined && { calories: Math.round(Number(updatedData.calories)) }),
      ...(updatedData.protein !== undefined && { protein: Math.round(Number(updatedData.protein)) }),
      ...(updatedData.carbs !== undefined && { carbs: Math.round(Number(updatedData.carbs)) }),
      ...(updatedData.fat !== undefined && { fat: Math.round(Number(updatedData.fat)) }),
      ...(updatedData.portion !== undefined && { portion: updatedData.portion }),
      ...(img !== undefined && { imageUrl: img, image: img }),
      updatedAt: serverTimestamp()
    };

    if (!isFirebaseConfigured || !db) {
      const saved = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
      const updated = saved.map((m) => (m.id === mealId ? { ...m, ...updateFields } : m));
      localStorage.setItem('snapfit_meals', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      return { id: mealId, ...updateFields };
    }

    const mealDocRef = doc(db, 'users', userId, 'meals', mealId);
    await updateDoc(mealDocRef, updateFields);
    return { id: mealId, ...updateFields };
  },

  /**
   * Delete a meal from users/{userId}/meals/{mealId}
   */
  async deleteMeal(userId, mealId) {
    if (!userId || !mealId) throw new Error('User ID and Meal ID are required.');

    if (!isFirebaseConfigured || !db) {
      const saved = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
      const updated = saved.filter((m) => m.id !== mealId);
      localStorage.setItem('snapfit_meals', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      return true;
    }

    const mealDocRef = doc(db, 'users', userId, 'meals', mealId);
    await deleteDoc(mealDocRef);
    return true;
  },

  /**
   * Real-time listener for TODAY'S meals in users/{userId}/meals
   * Powers the Dashboard with live updates
   */
  subscribeToTodayMeals(userId, callback) {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const todayDate = new Date().toLocaleDateString('en-CA');

    if (!isFirebaseConfigured || !db) {
      const load = () => {
        const saved = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
        const todayMeals = saved.filter((m) => !m.date || m.date === todayDate);
        callback(todayMeals);
      };
      load();
      window.addEventListener('storage', load);
      return () => window.removeEventListener('storage', load);
    }

    const mealsRef = collection(db, 'users', userId, 'meals');
    const q = query(mealsRef, where('date', '==', todayDate));

    return onSnapshot(
      q,
      (snapshot) => {
        const meals = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            foodName: data.foodName || data.name || 'Meal',
            name: data.foodName || data.name || 'Meal',
            mealType: data.mealType || data.type || 'Meal',
            type: data.mealType || data.type || 'Meal',
            calories: Number(data.calories) || 0,
            protein: Number(data.protein) || 0,
            carbs: Number(data.carbs) || 0,
            fat: Number(data.fat) || 0,
            portion: data.portion || '1 serving',
            source: data.source || 'camera',
            imageUrl: data.imageUrl || data.image || null,
            image: data.imageUrl || data.image || null,
            time: data.time || '',
            date: data.date || todayDate,
            createdAt: data.createdAt?.toDate?.() || new Date()
          };
        });
        callback(meals);
      },
      (error) => {
        console.warn('Today meals onSnapshot notice:', error.message);
        const saved = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
        callback(saved.filter((m) => !m.date || m.date === todayDate));
      }
    );
  },

  /**
   * Real-time listener for ALL user meals (for Meal History page)
   */
  subscribeToAllMeals(userId, callback) {
    if (!userId) {
      callback([]);
      return () => {};
    }

    if (!isFirebaseConfigured || !db) {
      const load = () => {
        const saved = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
        callback(saved);
      };
      load();
      window.addEventListener('storage', load);
      return () => window.removeEventListener('storage', load);
    }

    const mealsRef = collection(db, 'users', userId, 'meals');

    return onSnapshot(
      mealsRef,
      (snapshot) => {
        const meals = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            foodName: data.foodName || data.name || 'Meal',
            name: data.foodName || data.name || 'Meal',
            mealType: data.mealType || data.type || 'Meal',
            type: data.mealType || data.type || 'Meal',
            calories: Number(data.calories) || 0,
            protein: Number(data.protein) || 0,
            carbs: Number(data.carbs) || 0,
            fat: Number(data.fat) || 0,
            portion: data.portion || '1 serving',
            source: data.source || 'camera',
            imageUrl: data.imageUrl || data.image || null,
            image: data.imageUrl || data.image || null,
            time: data.time || '',
            date: data.date || '',
            createdAt: data.createdAt?.toDate?.() || new Date()
          };
        });
        // Sort descending by date & time
        meals.sort((a, b) => new Date((b.date || '1970-01-01') + ' ' + (b.time || '00:00')) - new Date((a.date || '1970-01-01') + ' ' + (a.time || '00:00')));
        callback(meals);
      },
      (error) => {
        console.warn('All meals onSnapshot notice:', error.message);
        const saved = JSON.parse(localStorage.getItem('snapfit_meals') || '[]');
        callback(saved);
      }
    );
  }
};
