import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  Flame,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

import { useHealth } from '../hooks/useHealth';
import { foodService } from '../services/foodService';
import { Button } from '../components/ui/Button';

export const FoodScan = () => {
  const navigate = useNavigate();
  const { addMeal } = useHealth();

  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const [servingMultiplier, setServingMultiplier] = useState(1.0);
  const [mealCategory, setMealCategory] = useState('Lunch');

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleStartScan = async () => {
    if (!imagePreview) return;
    setIsScanning(true);
    try {
      const data = await foodService.scanFoodImage(imagePreview);
      setScanResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveMeal = () => {
    if (!scanResult) return;
    const finalMeal = {
      name: scanResult.foodName,
      type: mealCategory,
      calories: Math.round(scanResult.calories * servingMultiplier),
      protein: Math.round(scanResult.protein * servingMultiplier),
      carbs: Math.round(scanResult.carbs * servingMultiplier),
      fat: Math.round(scanResult.fat * servingMultiplier),
      fiber: Math.round(scanResult.fiber * servingMultiplier),
      image: imagePreview || scanResult.image,
      confidence: scanResult.confidence,
      method: 'AI Food Scan'
    };

    addMeal(finalMeal);
    navigate('/dashboard');
  };

  const handleReset = () => {
    setImagePreview(null);
    setScanResult(null);
    setIsScanning(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>AI Computer Vision Engine</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Food Scanner
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Snap a photo of your meal. SnapFit AI automatically recognizes ingredients and calculates exact nutritional macros.
        </p>
      </div>

      {/* Main Scan Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

        {/* Upload & Camera Dropzone */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          {!imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full h-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Drag & Drop Food Photo
              </h4>
              <p className="text-xs text-slate-400 mb-4 max-w-xs">
                Supports JPG, PNG, WEBP files up to 10MB
              </p>
              <label className="cursor-pointer">
                <span className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 inline-flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Choose File</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="relative w-full h-full rounded-2xl overflow-hidden group">
              <img
                src={imagePreview}
                alt="Scan Preview"
                className="w-full h-80 object-cover rounded-2xl"
              />

              {/* Animated Laser Beam line during scanning */}
              {isScanning && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] absolute animate-scan" />
                  <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>AI is analyzing your meal...</span>
                  </div>
                </div>
              )}

              {!isScanning && !scanResult && (
                <button
                  onClick={handleReset}
                  className="absolute top-3 right-3 p-2 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Action Trigger Button */}
          {imagePreview && !scanResult && (
            <div className="w-full mt-4">
              <Button
                onClick={handleStartScan}
                variant="primary"
                size="lg"
                loading={isScanning}
                className="w-full font-bold"
                icon={Sparkles}
              >
                Scan Food with AI
              </Button>
            </div>
          )}
        </div>

        {/* Results Card & Editing Controls */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[380px]">
          {!scanResult ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
              <Camera className="w-12 h-12 stroke-[1.5]" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Active Scan Result</h4>
              <p className="text-xs">Upload a food photo on the left and tap "Scan Food" to generate live AI nutrition metrics.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header result */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    Confidence: {scanResult.confidence}%
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {scanResult.foodName}
                  </h3>
                  <p className="text-xs text-slate-400">{scanResult.servingSize}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-2 text-slate-400 hover:text-slate-600"
                  title="Rescan"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Serving Size & Category Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Serving Portion
                  </label>
                  <select
                    value={servingMultiplier}
                    onChange={(e) => setServingMultiplier(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value={0.5}>0.5x Serving</option>
                    <option value={1.0}>1.0x Regular</option>
                    <option value={1.5}>1.5x Extra Large</option>
                    <option value={2.0}>2.0x Double Portion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Meal Category
                  </label>
                  <select
                    value={mealCategory}
                    onChange={(e) => setMealCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
              </div>

              {/* Macros Breakdown Grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Calories</span>
                  <p className="text-sm font-black text-amber-500">
                    {Math.round(scanResult.calories * servingMultiplier)}
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Protein</span>
                  <p className="text-sm font-black text-emerald-500">
                    {Math.round(scanResult.protein * servingMultiplier)}g
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Carbs</span>
                  <p className="text-sm font-black text-sky-500">
                    {Math.round(scanResult.carbs * servingMultiplier)}g
                  </p>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Fat</span>
                  <p className="text-sm font-black text-violet-500">
                    {Math.round(scanResult.fat * servingMultiplier)}g
                  </p>
                </div>
              </div>

              {/* Confirm Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <Button
                  onClick={handleSaveMeal}
                  variant="primary"
                  size="lg"
                  className="flex-1 font-bold"
                  icon={CheckCircle2}
                >
                  Save to Meal Log
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
