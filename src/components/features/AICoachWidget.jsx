import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, Sparkles, RefreshCw, Plus, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useHealth } from '../../hooks/useHealth';
import { chatService } from '../../services/chatService';

export const AICoachWidget = ({ onClose }) => {
  const { user } = useAuth();
  const { totals, targets, showToast, addMeal } = useHealth();
  const [messages, setMessages] = useState(() => [
    {
      id: '1',
      sender: 'user',
      text: 'What should I eat for dinner today?',
      time: 'Just now'
    },
    {
      id: '2',
      sender: 'ai',
      text: "Based on your real-time intake today, a balanced high-protein dinner will hit your daily macro target smoothly!\n\nOptions:\n• Paneer + 2 Rotis + Green Salad\n• Grilled Chicken / Tofu + Quinoa\n• Dal Tadka + Brown Rice",
      time: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isThinking) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    try {
      const userContext = {
        dailyCalorieGoal: targets.dailyCalories,
        consumedCalories: totals.calories,
        proteinConsumed: totals.protein,
        proteinTarget: targets.proteinGrams,
        carbsConsumed: totals.carbs,
        fatConsumed: totals.fat,
        name: user?.name
      };

      const aiResponse = await chatService.sendMessage(user?.uid, text, userContext);
      if (aiResponse) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: aiResponse.message,
            time: aiResponse.time || 'Just now'
          }
        ]);
      }
    } catch (err) {
      console.warn('AI Coach widget error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleNewChat = () => {
    const freshMessages = [
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: `Hi ${user?.name || 'Athlete'}! I'm your SnapFit AI Coach. I'm actively monitoring your ${totals.calories} kcal and ${totals.protein}g protein intake today. How can I help you optimize your next meal?`,
        time: 'Just now'
      }
    ];
    setMessages(freshMessages);
    showToast('New chat session started', 'info');
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice recognition is not supported in this browser. Please type your message.', 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... speak now', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      showToast('Unable to start microphone', 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-[#14213D] sm:rounded-l-3xl border-l border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#EFFAF5]/60 to-transparent dark:from-slate-800/40 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#087F5B] text-white flex items-center justify-center shadow-md shadow-[#087F5B]/20 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              AI Coach
            </h3>
            <span className="text-[10px] text-[#087F5B] dark:text-emerald-400 font-bold flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] dark:bg-emerald-400 mr-1 animate-pulse" />
              Online • Realtime Insights
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleNewChat}
            className="text-xs font-bold text-[#087F5B] dark:text-emerald-400 hover:bg-[#EFFAF5] dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1"
            title="Start fresh conversation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close AI Coach (→)"
              aria-label="Close AI Coach"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3.5">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#087F5B] text-white rounded-br-none shadow-sm font-medium'
                  : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <div className="whitespace-pre-line font-normal">{msg.text}</div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.time}
            </span>
          </motion.div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl w-fit">
            <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-bounce delay-100" />
            <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-bounce delay-200" />
            <span className="font-semibold text-[11px] text-[#087F5B] dark:text-emerald-400">
              AI is thinking...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions chips */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
        {[
          'Dinner ideas?',
          'How is my protein?',
          'Log 1 glass water'
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-[10px] font-bold whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-[#EFFAF5] hover:text-[#087F5B] text-slate-600 dark:text-slate-300 transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#087F5B]"
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-2xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-[#087F5B] hover:bg-white dark:hover:bg-slate-800'
            }`}
            title="Speak message"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-2.5 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] disabled:opacity-50 text-white shadow-md transition-all flex items-center justify-center"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
