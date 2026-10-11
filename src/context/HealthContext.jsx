import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mealService } from '../services/mealService';
import { waterService } from '../services/waterService';

export const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.uid;

  // Real-time Firestore meals state (Today's meals)
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(true);

  // Real-time Firestore water state (Today's water)
  const [waterMl, setWaterMl] = useState(0);
  const [waterLogs, setWaterLogs] = useState([]);

  const [toast, setToast] = useState(null);

  // Safe notification system
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-welcome',
      type: 'info',
      message: 'Welcome to SnapFit! Log your meals via Food Camera or Food Chat to track your daily nutrition.',
      time: 'Just now',
      read: false
    }
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      Array.isArray(prev) ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : []
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (message, type = 'info') => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...(Array.isArray(prev) ? prev : [])]);
  };

  // User nutrition targets
  const targets = useMemo(() => {
    const dailyGoal = Number(user?.dailyCalorieGoal) || 2200;
    return {
      dailyCalories: dailyGoal,
      dailyCalorieGoal: dailyGoal,
      proteinGrams: Number(user?.proteinTargetGrams) || Math.round((dailyGoal * 0.25) / 4),
      carbsGrams: Number(user?.carbsTargetGrams) || Math.round((dailyGoal * 0.50) / 4),
      fatGrams: Number(user?.fatTargetGrams) || Math.round((dailyGoal * 0.25) / 9),
      waterMl: Number(user?.waterTargetMl) || 2500
    };
  }, [user]);

  // 1. Subscribe to Real-Time Today's Meals from Firestore
  useEffect(() => {
    if (!userId) {
      setMeals([]);
      setLoadingMeals(false);
      return;
    }

    setLoadingMeals(true);
    const unsub = mealService.subscribeToTodayMeals(userId, (todayMeals) => {
      setMeals(Array.isArray(todayMeals) ? todayMeals : []);
      setLoadingMeals(false);
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [userId]);

  // 2. Subscribe to Real-Time Today's Water from Firestore
  useEffect(() => {
    if (!userId) {
      setWaterMl(0);
      setWaterLogs([]);
      return;
    }

    const unsubWater = waterService.subscribeToTodayWater(userId, (totalTodayMl, entries) => {
      setWaterMl(Number(totalTodayMl) || 0);
      setWaterLogs(Array.isArray(entries) ? entries : []);
    });

    return () => {
      if (typeof unsubWater === 'function') unsubWater();
    };
  }, [userId]);

  // Add meal to Firestore
  const addMeal = async (newMeal) => {
    if (!userId) {
      showToast('Please log in to save meals.', 'error');
      throw new Error('Please log in to save meals.');
    }

    try {
      const saved = await mealService.addMeal(userId, newMeal);
      showToast(`Added "${saved.foodName}" to today's dashboard`, 'success');
      return saved;
    } catch (err) {
      console.error('Failed to save meal:', err);
      showToast(err.message || 'Failed to save meal', 'error');
      throw err;
    }
  };

  // Log water to Firestore
  const logWater = async (amountMl, source = 'manual', transcript = null) => {
    if (!userId) {
      showToast('Please log in to track water.', 'error');
      throw new Error('Please log in to track water.');
    }

    try {
      const saved = await waterService.logWater(userId, amountMl, source, transcript);
      showToast(`Logged ${amountMl} ml of water!`, 'success');
      return saved;
    } catch (err) {
      console.error('Failed to log water:', err);
      showToast(err.message || 'Failed to log water', 'error');
      throw err;
    }
  };

  // Update meal in Firestore
  const updateMeal = async (mealId, updatedData) => {
    if (!userId) return;
    try {
      await mealService.updateMeal(userId, mealId, updatedData);
      showToast('Meal updated successfully', 'success');
    } catch (err) {
      console.error('Failed to update meal:', err);
      showToast(err.message || 'Failed to update meal', 'error');
      throw err;
    }
  };

  // Delete meal from Firestore
  const deleteMeal = async (mealId) => {
    if (!userId) return;
    try {
      await mealService.deleteMeal(userId, mealId);
      showToast('Meal removed from logs', 'info');
    } catch (err) {
      console.error('Failed to delete meal:', err);
      showToast(err.message || 'Failed to delete meal', 'error');
      throw err;
    }
  };

  // 3. Real-time daily calculations strictly from today's logged meals and water
  const totals = useMemo(() => {
    const safeMeals = Array.isArray(meals) ? meals : [];
    const mealTotals = safeMeals.reduce(
      (acc, meal) => {
        acc.calories += Math.round(Number(meal?.calories) || 0);
        acc.protein += Math.round(Number(meal?.protein) || 0);
        acc.carbs += Math.round(Number(meal?.carbs) || 0);
        acc.fat += Math.round(Number(meal?.fat) || 0);
        acc.fiber += Math.round(Number(meal?.fiber) || 0);
        acc.sugar += Math.round(Number(meal?.sugar) || 0);
        acc.sodium += Math.round(Number(meal?.sodium) || 0);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );

    return {
      ...mealTotals,
      water: waterMl
    };
  }, [meals, waterMl]);

  const calorieRemaining = Math.max(0, targets.dailyCalories - totals.calories);
  const isGoalExceeded = totals.calories > targets.dailyCalories;

  return (
    <HealthContext.Provider
      value={{
        meals: Array.isArray(meals) ? meals : [],
        loadingMeals,
        addMeal,
        updateMeal,
        deleteMeal,
        waterMl,
        waterLogs: Array.isArray(waterLogs) ? waterLogs : [],
        logWater,
        targets,
        totals,
        calorieRemaining,
        isGoalExceeded,
        toast,
        showToast,
        notifications: Array.isArray(notifications) ? notifications : [],
        markNotificationRead,
        clearAllNotifications,
        addNotification
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};
