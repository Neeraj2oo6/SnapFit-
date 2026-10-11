import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, Heart, Plus, CheckCircle2, Flame } from 'lucide-react';
import { AI_RECOMMENDATIONS } from '../data/mockRecommendations';
import { useHealth } from '../hooks/useHealth';
import { Button } from '../components/ui/Button';

export const Recommendations = () => {
  const navigate = useNavigate();
  const { addMeal, showToast } = useHealth();
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
      showToast('Removed recipe from saved favorites', 'info');
    } else {
      setFavorites([...favorites, id]);
      showToast('Recipe added to your saved favorites', 'success');
    }
  };

  const handleAddRecommendationToLog = (item) => {
    const finalMeal = {
      name: item.title,
      type: item.category,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: 6,
      image: item.image,
      confidence: 98,
      method: 'AI Recommendation'
    };

    addMeal(finalMeal);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Hyper-Personalized AI Recipes</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Personalized Meal Recommendations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Recipes tailored to your remaining 78g protein target, 2200 kcal daily budget, and health score.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AI_RECOMMENDATIONS.map((item) => {
          const isFav = favorites.includes(item.id);
          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 rounded-2xl object-cover"
                  />
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md backdrop-blur-md transition-transform hover:scale-110"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                  </button>
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 text-white text-xs font-bold backdrop-blur-md">
                    Health Score {item.healthScore}/100
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    {item.category}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.prepTime}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {item.tags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl text-center text-xs mb-4">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Calories</span>
                    <p className="font-extrabold text-amber-500">{item.calories}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Protein</span>
                    <p className="font-extrabold text-emerald-500">{item.protein}g</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Carbs</span>
                    <p className="font-extrabold text-sky-500">{item.carbs}g</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold">Fat</span>
                    <p className="font-extrabold text-violet-500">{item.fat}g</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleAddRecommendationToLog(item)}
                variant="primary"
                size="md"
                className="w-full font-bold"
                icon={Plus}
              >
                Add to Today's Meal Log
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
