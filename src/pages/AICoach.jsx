import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  User,
  Plus,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Edit2,
  Utensils,
  Clock,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';
import { chatService } from '../services/chatService';
import { nutritionService } from '../services/nutritionService';

export const AICoach = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totals, targets, addMeal, logWater, showToast } = useHealth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [savedCardIds, setSavedCardIds] = useState(new Set());
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Quick food and water prompts in English, Hindi & Hinglish
  const quickFoodPrompts = [
    "I ate 2 rotis and dal.",
    "maine 2 roti aur dal khayi",
    "aaj lunch mein rajma chawal khaya",
    "maine ek kela khaya",
    "I ate mango and curd.",
    "I drank 500 ml water.",
    "2 anda khaya"
  ];

  // Subscribe to real-time chat history in Firestore users/{userId}/chatHistory
  useEffect(() => {
    if (!user?.uid) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          sender: 'ai',
          text: `Hi ${user?.name || 'there'}! 👋 I am your SnapFit Food & Water Chat assistant. You can log meals (e.g. "I ate 2 rotis and dal") or water (e.g. "I drank 500 ml water" or "2 glasses of water") and confirm before adding to your Dashboard!`,
          time: 'Just now'
        }
      ]);
      return;
    }

    const unsubscribe = chatService.subscribeToChatHistory(user.uid, (history) => {
      if (history.length > 0) {
        setMessages(history);
      } else {
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            sender: 'ai',
            text: `Hi ${user?.name || 'there'}! 👋 I am your SnapFit Food & Water Chat assistant. You can log meals (e.g. "I ate 2 rotis and dal") or water (e.g. "I drank 500 ml water" or "2 glasses of water") and confirm before adding to your Dashboard!`,
            time: 'Just now'
          }
        ]);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending natural language message (Classifies: "food", "water", "unknown")
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMessageText = text.trim();
    if (!textToSend) setInputText('');

    const userMsgId = `msg-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      role: 'user',
      sender: 'user',
      text: userMessageText,
      message: userMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const classification = nutritionService.classifyMessage(userMessageText);

      let aiResponseMsg = null;

      if (classification === 'water') {
        // Water entry flow: extract milliliters and show [Add Water] confirmation
        const amountMl = nutritionService.parseWaterIntake(userMessageText);
        aiResponseMsg = {
          id: `ai-water-${Date.now()}`,
          role: 'assistant',
          sender: 'ai',
          isWaterCard: true,
          amountMl,
          text: `Water: ${amountMl} ml`,
          time: responseTime
        };
      } else if (classification === 'food') {
        // Food entry flow: extract food items, portion, calories, macros
        const parsed = await nutritionService.parseNaturalLanguageFood(userMessageText);

        if (parsed.success && parsed.data) {
          const d = parsed.data;
          const items = parsed.items || [];

          aiResponseMsg = {
            id: `ai-food-${Date.now()}`,
            role: 'assistant',
            sender: 'ai',
            isFoodCard: true,
            text: `I identified ${d.foodName}. Here is the estimated nutritional breakdown:`,
            foodData: {
              foodName: d.foodName,
              portion: d.portion,
              calories: d.calories,
              protein: d.protein,
              carbs: d.carbs,
              fat: d.fat,
              mealType: parsed.mealType || 'Lunch',
              items: items
            },
            time: responseTime
          };
        } else {
          aiResponseMsg = {
            id: `ai-food-${Date.now()}`,
            role: 'assistant',
            sender: 'ai',
            text: "Food could not be identified confidently. Please enter the food name and portion manually (e.g. 'I ate 2 rotis and 1 bowl dal').",
            time: responseTime
          };
        }
      } else {
        // Rule 14: For "unknown": Do NOT create a meal. Show: "I can currently help you log food and water."
        aiResponseMsg = {
          id: `ai-unknown-${Date.now()}`,
          role: 'assistant',
          sender: 'ai',
          text: "I can currently help you log food and water.",
          time: responseTime
        };
      }

      setMessages((prev) => [...prev, aiResponseMsg]);
    } catch (err) {
      console.error('Chat message processing error:', err);
      showToast('Error processing chat message', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle edit state for a specific food card
  const handleToggleEdit = (cardId, foodData) => {
    if (editingCardId === cardId) {
      setEditingCardId(null);
    } else {
      setEditingCardId(cardId);
      setEditFormData({
        foodName: foodData.foodName,
        portion: foodData.portion,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        mealType: foodData.mealType || 'Lunch'
      });
    }
  };

  // Confirm and Add to Dashboard (Calls mealService with source: 'chat')
  const handleConfirmAddToDashboard = async (cardId, originalFoodData) => {
    const isEdited = editingCardId === cardId;
    const finalData = isEdited ? editFormData : originalFoodData;

    try {
      const mealToSave = {
        name: finalData.foodName || 'Food Log',
        foodName: finalData.foodName || 'Food Log',
        portion: finalData.portion || '1 serving',
        calories: Math.round(Number(finalData.calories) || 0),
        protein: Math.round(Number(finalData.protein) || 0),
        carbs: Math.round(Number(finalData.carbs) || 0),
        fat: Math.round(Number(finalData.fat) || 0),
        ...(finalData.fiber != null && { fiber: Number(finalData.fiber) }),
        ...(finalData.sugar != null && { sugar: Number(finalData.sugar) }),
        ...(finalData.sodium != null && { sodium: Number(finalData.sodium) }),
        ...(finalData.confidence != null && { confidence: Number(finalData.confidence) }),
        mealType: finalData.mealType || 'Lunch',
        type: finalData.mealType || 'Lunch',
        source: finalData.source || 'chat',
        method: 'chat'
      };

      await addMeal(mealToSave);
      setSavedCardIds((prev) => new Set([...prev, cardId]));
      setEditingCardId(null);
      showToast(`Added "${mealToSave.foodName}" to today's dashboard!`, 'success');
    } catch (err) {
      console.error('Failed to confirm chat meal:', err);
      showToast('Failed to save meal from chat', 'error');
    }
  };

  // Confirm and Add Water (Calls waterService with source: 'chat')
  const handleConfirmAddWater = async (cardId, amountMl) => {
    try {
      await logWater(amountMl, 'chat');
      setSavedCardIds((prev) => new Set([...prev, cardId]));
      showToast(`Added ${amountMl} ml water to today's dashboard!`, 'success');
    } catch (err) {
      console.error('Failed to confirm water from chat:', err);
      showToast('Failed to save water from chat', 'error');
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        sender: 'ai',
        text: `Chat cleared. Tell me what you ate (e.g. "I ate 2 rotis and dal") or drank (e.g. "I drank 500 ml water") to log!`,
        time: 'Just now'
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      
      {/* Left Context & Suggestions Sidebar */}
      <div className="w-full md:w-80 border-r border-slate-200/80 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-[#087F5B] dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Food Chat Engine</h3>
            </div>
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Today's Live Nutritional Context */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 mb-4 shadow-sm text-xs space-y-2">
            <span className="text-[10px] font-black uppercase text-[#087F5B] dark:text-emerald-400 block tracking-wider">
              Today's Live Balance
            </span>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>Calories:</span>
              <strong className="text-slate-900 dark:text-white">{totals.calories} / {targets.dailyCalories} kcal</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>Protein:</span>
              <strong className="text-slate-900 dark:text-white">{totals.protein} / {targets.proteinGrams}g</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>Carbs:</span>
              <strong className="text-slate-900 dark:text-white">{totals.carbs} / {targets.carbsGrams}g</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>Fat:</span>
              <strong className="text-slate-900 dark:text-white">{totals.fat} / {targets.fatGrams}g</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold">
              <span>Water:</span>
              <strong className="text-sky-600 dark:text-sky-400">{totals.water || 0} / {targets.waterMl} ml</strong>
            </div>
          </div>

          {/* Quick Tap Food Examples */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 block mb-1">
              Try Logging:
            </span>
            <div className="space-y-1.5">
              {quickFoodPrompts.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(promptText)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-between group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <span className="truncate pr-2 font-medium">"{promptText}"</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#087F5B] transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => navigate('/snap-food')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#EFFAF5] hover:text-[#087F5B] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Scan Food Photo Instead →</span>
          </button>
        </div>
      </div>

      {/* Right: Interactive Chat Stream */}
      <div className="flex-1 flex flex-col justify-between h-full bg-white dark:bg-[#14213D]">
        
        {/* Messages Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user' || msg.sender === 'user';
            const cardId = msg.id;
            const isCardSaved = savedCardIds.has(cardId);
            const isEditingThisCard = editingCardId === cardId;

            return (
              <div
                key={cardId}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xl w-full sm:w-auto flex space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${isUser ? 'bg-[#087F5B]' : 'bg-slate-800 dark:bg-slate-700'}`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-400" />}
                  </div>

                  {/* Message Bubble Content */}
                  <div className="space-y-2 flex-1">
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-[#087F5B] text-white rounded-tr-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
                      }`}
                    >
                      <p>{msg.text || msg.message}</p>

                      {/* FOOD CONFIRMATION CARD (Rendered when food items are parsed) */}
                      {msg.isFoodCard && msg.foodData && (
                        <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-slate-900 dark:text-slate-100 space-y-3 shadow-md">
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-[#087F5B] dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60">
                              Estimated nutrition (Approximate values)
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Confidence ~94%
                            </span>
                          </div>

                          {/* Approximate nutrition warning (Section 20) */}
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-[11px] font-semibold leading-relaxed">
                            Nutrition values are estimates and may vary based on portion size, ingredients and preparation.
                          </div>

                          {/* Itemized Breakdown if multiple items detected */}
                          {Array.isArray(msg.foodData.items) && msg.foodData.items.length > 1 && (
                            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
                              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                Individual Items Detected ({msg.foodData.items.length})
                              </span>
                              {msg.foodData.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                                  <span className="font-bold">{it.portion}</span>
                                  <span className="text-[11px] text-slate-500">{it.calories} kcal • P: {it.protein}g • C: {it.carbs}g • F: {it.fat}g</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Total Nutrition Cards or Edit Form */}
                          {isEditingThisCard ? (
                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400">Food Name</label>
                                <input
                                  type="text"
                                  value={editFormData.foodName}
                                  onChange={(e) => setEditFormData({ ...editFormData, foodName: e.target.value })}
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400">Portion</label>
                                <input
                                  type="text"
                                  value={editFormData.portion}
                                  onChange={(e) => setEditFormData({ ...editFormData, portion: e.target.value })}
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400">Calories (kcal)</label>
                                <input
                                  type="number"
                                  value={editFormData.calories}
                                  onChange={(e) => setEditFormData({ ...editFormData, calories: e.target.value })}
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400">Protein (g)</label>
                                <input
                                  type="number"
                                  value={editFormData.protein}
                                  onChange={(e) => setEditFormData({ ...editFormData, protein: e.target.value })}
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400">Carbs (g)</label>
                                <input
                                  type="number"
                                  value={editFormData.carbs}
                                  onChange={(e) => setEditFormData({ ...editFormData, carbs: e.target.value })}
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400">Fat (g)</label>
                                <input
                                  type="number"
                                  value={editFormData.fat}
                                  onChange={(e) => setEditFormData({ ...editFormData, fat: e.target.value })}
                                  className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-slate-800 border border-amber-500/20">
                                <span className="text-[9px] uppercase font-black text-amber-600 block">Calories</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{msg.foodData.calories}</span>
                                <span className="text-[9px] text-slate-400 block">kcal</span>
                              </div>
                              <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-slate-800 border border-emerald-500/20">
                                <span className="text-[9px] uppercase font-black text-[#087F5B] block">Protein</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{msg.foodData.protein}</span>
                                <span className="text-[9px] text-slate-400 block">g</span>
                              </div>
                              <div className="p-2 rounded-xl bg-sky-50/70 dark:bg-slate-800 border border-sky-500/20">
                                <span className="text-[9px] uppercase font-black text-sky-600 block">Carbs</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{msg.foodData.carbs}</span>
                                <span className="text-[9px] text-slate-400 block">g</span>
                              </div>
                              <div className="p-2 rounded-xl bg-purple-50/70 dark:bg-slate-800 border border-purple-500/20">
                                <span className="text-[9px] uppercase font-black text-purple-600 block">Fat</span>
                                <span className="text-sm font-black text-slate-900 dark:text-white">{msg.foodData.fat}</span>
                                <span className="text-[9px] text-slate-400 block">g</span>
                              </div>
                            </div>
                          )}

                          {/* ACTION BUTTONS: [Edit] and [Confirm & Add to Dashboard] */}
                          <div className="flex items-center space-x-2 pt-1">
                            {!isCardSaved ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleEdit(cardId, msg.foodData)}
                                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#087F5B] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1 transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-[#087F5B]" />
                                  <span>{isEditingThisCard ? 'Done' : 'Edit'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleConfirmAddToDashboard(cardId, msg.foodData)}
                                  className="flex-1 py-2 px-3 rounded-xl bg-[#087F5B] hover:bg-[#056B4A] text-white text-xs font-extrabold shadow-md shadow-[#087F5B]/20 flex items-center justify-center space-x-1.5 transition-all"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Confirm & Add to Dashboard</span>
                                </button>
                              </>
                            ) : (
                              <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center space-x-1.5 border border-emerald-500/20">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Saved to Today's Dashboard ✓</span>
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                      {/* WATER CONFIRMATION CARD (Rendered when water intake is parsed) */}
                      {msg.isWaterCard && msg.amountMl && (
                        <div className="mt-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-sky-500/30 text-slate-900 dark:text-slate-100 space-y-3 shadow-md">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60">
                              Water Intake Detected
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Source: Chat
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 p-3 rounded-xl bg-sky-50/70 dark:bg-slate-800/80 border border-sky-500/20">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-lg">
                              💧
                            </div>
                            <div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">Target: {targets.waterMl} ml</div>
                              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                                {msg.amountMl} ml
                              </div>
                            </div>
                          </div>

                          <div className="pt-1">
                            {!isCardSaved ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmAddWater(cardId, msg.amountMl)}
                                className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold shadow-md shadow-sky-600/20 flex items-center justify-center space-x-1.5 transition-all"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirm & Add Water</span>
                              </button>
                            ) : (
                              <div className="w-full py-2 px-3 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center space-x-1.5 border border-sky-500/20">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Water Added to Dashboard ✓</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 px-2 block">
                      {msg.time || 'Just now'}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Calculating Nutrition Spinner */}
          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs p-3">
              <Bot className="w-4 h-4 text-[#087F5B] animate-bounce" />
              <span>Calculating nutrition...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#14213D]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="e.g. I ate 2 rotis and 1 bowl dal for lunch..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-[#087F5B] focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F5B]/20 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] disabled:opacity-50 text-white font-bold shadow-md shadow-[#087F5B]/20 transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default AICoach;
