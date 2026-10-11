import { AI_RESPONSES_KNOWLEDGE } from '../data/mockChat';

export const aiService = {
  /**
   * Send user message to Backend AI Chat endpoint (/api/chat).
   * Calculates nutrition, saves to database, and returns meal data if food was logged.
   */
  async askCoach(userMessage) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    try {
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: result.reply,
          mealLogged: result.mealLogged || null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
      }
    } catch (err) {
      console.warn('Backend /api/chat unreachable, falling back to local coach knowledge:', err.message);
    }

    // Fallback response if backend is offline
    await new Promise((res) => setTimeout(res, 800));
    const query = userMessage.toLowerCase();
    let reply = "";

    if (query.includes("dinner")) {
      reply = AI_RESPONSES_KNOWLEDGE.dinner;
    } else if (query.includes("protein")) {
      reply = AI_RESPONSES_KNOWLEDGE.protein;
    } else if (query.includes("healthy") || query.includes("diet")) {
      reply = AI_RESPONSES_KNOWLEDGE.healthy;
    } else if (query.includes("breakfast")) {
      reply = AI_RESPONSES_KNOWLEDGE.breakfast;
    } else if (query.includes("score")) {
      reply = AI_RESPONSES_KNOWLEDGE.score;
    } else {
      reply = `Thanks for asking! Based on your target goals and active meal logs, maintaining a balanced ratio of 30% Protein, 45% Carbs, and 25% Fat will keep your energy peak and optimize recovery. Would you like me to suggest a recipe or adjust your macro goals?`;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: "ai",
      text: reply,
      mealLogged: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
};
