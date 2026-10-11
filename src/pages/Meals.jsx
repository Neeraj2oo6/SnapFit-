import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Utensils,
  Search,
  Calendar,
  Plus,
  Filter,
  Flame,
  Edit2,
  Trash2,
  X,
  Upload,
  Clock,
  Eye,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';
import { mealService } from '../services/mealService';
import { foodService } from '../services/foodService';
import { Button } from '../components/ui/Button';

export const Meals = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useHealth();
  const [searchParams] = useSearchParams();

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Form inputs for Add/Edit
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Breakfast');
  const [formCalories, setFormCalories] = useState('');
  const [formProtein, setFormProtein] = useState('');
  const [formCarbs, setFormCarbs] = useState('');
  const [formFat, setFormFat] = useState('');
  const [formFiber, setFormFiber] = useState('4');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formServingSize, setFormServingSize] = useState('1 plate');
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tabs = ['All', 'Breakfast', 'Lunch', 'Evening Snack', 'Dinner'];

  // Subscribe to real-time meals from Firestore users/{userId}/meals
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = mealService.subscribeToAllMeals(user.uid, (fetchedMeals) => {
      setMeals(fetchedMeals);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [user?.uid]);

  // Compute daily totals safely
  const safeMeals = Array.isArray(meals) ? meals : [];
  const totals = safeMeals.reduce(
    (acc, m) => {
      acc.calories += Number(m?.calories) || 0;
      acc.protein += Number(m?.protein) || 0;
      acc.carbs += Number(m?.carbs) || 0;
      acc.fat += Number(m?.fat) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Filtered meals
  const filteredMeals = safeMeals.filter((meal) => {
    const mealCategory = meal?.mealType || meal?.type || '';
    const matchesTab =
      activeTab === 'All' ||
      mealCategory.toLowerCase() === activeTab.toLowerCase() ||
      (activeTab === 'Evening Snack' && mealCategory.toLowerCase().includes('snack'));
    const foodTitle = meal?.foodName || meal?.name || '';
    const matchesSearch = foodTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormImage(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormType('Breakfast');
    setFormCalories('400');
    setFormProtein('20');
    setFormCarbs('45');
    setFormFat('12');
    setFormFiber('4');
    setFormQuantity('1');
    setFormServingSize('1 plate');
    setFormImage(null);
    setFormImagePreview('');
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter a meal name', 'warning');
      return;
    }

    if (!user?.uid) {
      showToast('Please sign in to add meals', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = null;
      if (formImage) {
        imageUrl = await foodService.uploadFoodImage(user.uid, formImage);
      }

      await mealService.addMeal(user.uid, {
        name: formName.trim(),
        type: formType,
        calories: Number(formCalories) || 0,
        protein: Number(formProtein) || 0,
        carbs: Number(formCarbs) || 0,
        fat: Number(formFat) || 0,
        fiber: Number(formFiber) || 0,
        portion: formServingSize || '1 plate',
        image: imageUrl || formImagePreview || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        method: 'Manual Entry'
      });

      showToast(`Added "${formName}" to meals (+10 Fit Points)`, 'success');
      setIsAddModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save meal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Meal
  const handleOpenEdit = (meal) => {
    setSelectedMeal(meal);
    setFormName(meal.name || '');
    setFormType(meal.type || 'Breakfast');
    setFormCalories(String(meal.calories || '0'));
    setFormProtein(String(meal.protein || '0'));
    setFormCarbs(String(meal.carbs || '0'));
    setFormFat(String(meal.fat || '0'));
    setFormFiber(String(meal.fiber || '0'));
    setFormQuantity(String(meal.quantity || '1'));
    setFormServingSize(meal.serving_size || meal.servingSize || meal.portion || '1 serving');
    setFormImagePreview(meal.image_url || meal.image || '');
    setIsEditModalOpen(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedMeal || !user?.uid) return;

    setSubmitting(true);
    try {
      let imageUrl = selectedMeal.image || selectedMeal.imageUrl;
      if (formImage) {
        imageUrl = await foodService.uploadFoodImage(user.uid, formImage);
      }

      await mealService.updateMeal(user.uid, selectedMeal.id, {
        foodName: formName.trim(),
        mealType: formType,
        calories: Number(formCalories) || 0,
        protein: Number(formProtein) || 0,
        carbs: Number(formCarbs) || 0,
        fat: Number(formFat) || 0,
        fiber: Number(formFiber) || 0,
        portion: formServingSize || '1 plate',
        imageUrl
      });

      showToast('Meal updated successfully!', 'success');
      setIsEditModalOpen(false);
    } catch (err) {
      showToast('Failed to update meal', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Meal
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    if (!user?.uid) return;

    try {
      await mealService.deleteMeal(user.uid, id);
      showToast(`Removed "${name}" from logs`, 'info');
    } catch (err) {
      showToast('Failed to delete meal', 'error');
    }
  };

  // Handle View Details
  const handleOpenDetail = (meal) => {
    setSelectedMeal(meal);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Summary */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-400 text-xs font-black mb-2">
            <Utensils className="w-3.5 h-3.5" />
            <span>Meal Management Module</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Daily Meal Logs & Nutrition History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track breakfast, lunch, snacks, and dinner with real-time Cloud Firestore synchronization.
          </p>
        </div>

        {/* Daily totals summary badges */}
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Calories</span>
            <p className="text-base font-black text-amber-500">{totals.calories} <span className="text-xs font-bold">kcal</span></p>
          </div>
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Protein</span>
            <p className="text-base font-black text-[#087F5B] dark:text-emerald-400">{totals.protein}g</p>
          </div>
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Carbs</span>
            <p className="text-base font-black text-sky-500">{totals.carbs}g</p>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Fat</span>
            <p className="text-base font-black text-purple-500">{totals.fat}g</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Tabs + Search + Action Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm w-full md:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#087F5B] text-white shadow-md shadow-[#087F5B]/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logged food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#14213D] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#087F5B]"
            />
          </div>

          <Button
            onClick={handleOpenAdd}
            variant="primary"
            size="md"
            icon={Plus}
            className="whitespace-nowrap"
          >
            Add Meal
          </Button>
        </div>
      </div>

      {/* Meals Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#087F5B] mb-2" />
          <p className="text-xs">Connecting to Firestore meals collection...</p>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-[#14213D] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Utensils className="w-12 h-12 stroke-[1.5] text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            No Meals Found
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No meals matched your search "${searchQuery}".`
              : `You haven't logged any meals in the "${activeTab}" category yet.`}
          </p>
          <Button
            onClick={handleOpenAdd}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Log First Meal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMeals.map((meal) => (
            <div
              key={meal.id}
              className="rounded-3xl bg-white dark:bg-[#14213D] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Meal Image */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={meal.image || meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white">
                      {meal.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase backdrop-blur-md text-white ${
                      (meal.source || '').toLowerCase() === 'chat' ? 'bg-sky-600/90' : 'bg-[#087F5B]/90'
                    }`}>
                      {(meal.source || '').toLowerCase() === 'chat' ? 'Chat' : 'Camera'}
                    </span>
                  </div>
                  {meal.time && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{meal.date ? `${meal.date} • ` : ''}{meal.time}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                      {meal.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-slate-400 mt-0.5">
                      <span>Portion: {meal.portion || '1 serving'}</span>
                      {meal.date && <span className="font-semibold">{meal.date}</span>}
                    </div>
                  </div>

                  {/* Macros badges */}
                  <div className="grid grid-cols-4 gap-1.5 text-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Calories</span>
                      <span className="text-xs font-black text-amber-500">{meal.calories}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Protein</span>
                      <span className="text-xs font-black text-[#087F5B] dark:text-emerald-400">{meal.protein}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Carbs</span>
                      <span className="text-xs font-black text-sky-500">{meal.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 block">Fat</span>
                      <span className="text-xs font-black text-purple-500">{meal.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => handleOpenDetail(meal)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(meal)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#087F5B] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title="Edit meal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id, meal.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit / Detail Modals */}
      {/* ADD MEAL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#14213D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Meal</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Meal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paneer Rice, Grilled Chicken..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Meal Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Evening Snack">Evening Snack</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Portion / Serving</label>
                  <input
                    type="text"
                    value={formServingSize}
                    onChange={(e) => setFormServingSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Calories</label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={formProtein}
                    onChange={(e) => setFormProtein(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={formCarbs}
                    onChange={(e) => setFormCarbs(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={formFat}
                    onChange={(e) => setFormFat(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Meal Photo (Firebase Storage)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#087F5B] file:text-white hover:file:bg-[#056B4A]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={submitting}
                  className="flex-1 font-bold"
                >
                  Save to Firestore
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEAL MODAL */}
      {isEditModalOpen && selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#14213D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Meal</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Meal Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Meal Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Evening Snack">Evening Snack</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Portion</label>
                  <input
                    type="text"
                    value={formServingSize}
                    onChange={(e) => setFormServingSize(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Calories</label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={formProtein}
                    onChange={(e) => setFormProtein(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={formCarbs}
                    onChange={(e) => setFormCarbs(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fat (g)</label>
                  <input
                    type="number"
                    value={formFat}
                    onChange={(e) => setFormFat(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Update Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#087F5B] file:text-white hover:file:bg-[#056B4A]"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={submitting}
                  className="flex-1 font-bold"
                >
                  Update Meal
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#14213D] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedMeal.name}</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={selectedMeal.image || selectedMeal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
              alt={selectedMeal.name}
              className="w-full h-48 rounded-2xl object-cover"
            />

            <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Calories</span>
                <span className="text-sm font-black text-amber-500">{selectedMeal.calories} kcal</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Protein</span>
                <span className="text-sm font-black text-[#087F5B]">{selectedMeal.protein}g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Carbs</span>
                <span className="text-sm font-black text-sky-500">{selectedMeal.carbs}g</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Fat</span>
                <span className="text-sm font-black text-purple-500">{selectedMeal.fat}g</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>Type: <strong>{selectedMeal.type}</strong></p>
              <p>Portion: <strong>{selectedMeal.portion || '1 plate'}</strong></p>
              {selectedMeal.time && <p>Time: <strong>{selectedMeal.time}</strong></p>}
            </div>

            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDetailModalOpen(false)}
              className="w-full font-bold"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
