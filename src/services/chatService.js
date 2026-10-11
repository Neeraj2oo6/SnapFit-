import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { AI_RESPONSES_KNOWLEDGE } from '../data/mockChat';

export const chatService = {
  /**
   * Send question to AI Coach with user's daily nutrition context
   */
  async sendMessage(userId, message, userContext = {}) {
    if (!message || !message.trim()) return null;

    const trimmedMsg = message.trim();
    const backendBaseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // 1. Add user message to Firestore
    if (userId && isFirebaseConfigured) {
      try {
        const chatRef = collection(db, 'users', userId, 'chatHistory');
        await addDoc(chatRef, {
          role: 'user',
          message: trimmedMsg,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Failed to save user chat message to Firestore:', err.message);
      }
    }

    // 2. Fetch AI Coach Response
    let assistantReply = '';
    try {
      const response = await fetch(`${backendBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMsg,
          userId,
          userContext
        })
      });

      if (response.ok) {
        const data = await response.json();
        assistantReply = data.reply || data.message;
      }
    } catch (err) {
      console.warn('Backend chat endpoint unreachable, using smart coach contextual fallback:', err.message);
    }

    // 3. Fallback AI response reasoning if backend/cloud function is offline
    if (!assistantReply) {
      const query = trimmedMsg.toLowerCase();
      const dailyGoal = userContext.dailyCalorieGoal || 2200;
      const consumed = userContext.consumedCalories || 0;
      const remaining = Math.max(0, dailyGoal - consumed);
      const proteinConsumed = userContext.proteinConsumed || 0;
      const proteinTarget = userContext.proteinTarget || 120;

      if (query.includes('dinner') || query.includes('what should i eat')) {
        assistantReply = `You've consumed ${consumed} of your ${dailyGoal} kcal goal today (${remaining} kcal remaining). For dinner, I suggest a lean protein and complex carb plate like grilled paneer or chicken with quinoa and steamed broccoli (approx. 450-500 kcal, 28g protein) to hit your macros smoothly!`;
      } else if (query.includes('protein')) {
        assistantReply = `You're currently at ${proteinConsumed}g of your ${proteinTarget}g daily protein target. Excellent high-protein, low-calorie options include whey isolate (25g), Greek yogurt (15g), boiled egg whites (12g), and tofu/soya chunks (20g).`;
      } else if (query.includes('snack') || query.includes('evening')) {
        assistantReply = `For an evening snack, try roasted chickpeas (makhana/chana), an apple with 1 spoon of peanut butter, or a protein shake. It'll keep your energy steady without exceeding your caloric budget!`;
      } else {
        assistantReply = `Keep up the momentum! Today you've logged ${consumed} kcal out of ${dailyGoal} kcal with ${proteinConsumed}g protein. Staying hydrated and pacing your meals will give you clean, sustained energy throughout the day.`;
      }
    }

    // 4. Save Assistant message to Firestore
    if (userId && isFirebaseConfigured) {
      try {
        const chatRef = collection(db, 'users', userId, 'chatHistory');
        await addDoc(chatRef, {
          role: 'assistant',
          message: assistantReply,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.warn('Failed to save assistant chat reply to Firestore:', err.message);
      }
    }

    return {
      role: 'assistant',
      message: assistantReply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  },

  /**
   * Real-time listener for user's chat history in users/{userId}/chatHistory
   */
  subscribeToChatHistory(userId, callback) {
    if (!userId) {
      callback([]);
      return () => {};
    }

    if (!isFirebaseConfigured) {
      const saved = JSON.parse(localStorage.getItem('snapfit_chat_history') || '[]');
      callback(saved);
      return () => {};
    }

    const chatRef = collection(db, 'users', userId, 'chatHistory');
    const q = query(chatRef, orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            role: data.role || 'assistant',
            sender: data.role === 'user' ? 'user' : 'ai',
            message: data.message || '',
            text: data.message || '',
            createdAt: data.createdAt?.toDate?.() || new Date(),
            time: data.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Just now'
          };
        });
        callback(messages);
      },
      (err) => {
        console.warn('Chat history onSnapshot error:', err.message);
      }
    );
  }
};
