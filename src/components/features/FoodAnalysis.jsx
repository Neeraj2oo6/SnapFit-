import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Edit2,
  ArrowRight,
  Plus,
  Flame,
  Zap,
  RotateCcw,
  X,
  Upload
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useHealth } from '../../hooks/useHealth';
import { foodService } from '../../services/foodService';

export const FoodAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addMeal, showToast } = useHealth();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Camera & Image States
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);

  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Lunch');

  // Nutrition Result State
  const [foodName, setFoodName] = useState('Paneer Rice');
  const [portion, setPortion] = useState('1 plate');
  const [calories, setCalories] = useState('520');
  const [protein, setProtein] = useState('22');
  const [carbs, setCarbs] = useState('58');
  const [fat, setFat] = useState('20');
  const [fiber, setFiber] = useState('6');
  const [confidence, setConfidence] = useState(94);
  const [uploadedStorageUrl, setUploadedStorageUrl] = useState(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [editingItemIdx, setEditingItemIdx] = useState(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError('');
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera permission denied or camera not available. You can upload an image instead.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Auto-start camera on mount if no image
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Capture Photo
  const handleTakePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    canvas.toBlob((blob) => {
      setCapturedBlob(blob);
    }, 'image/jpeg', 0.9);

    stopCamera();
  };

  // Retake Photo
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setAnalysisComplete(false);
    setAnalysisError('');
    setUploadedStorageUrl(null);
    startCamera();
  };

  // Upload from Gallery
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCapturedBlob(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
      setAnalysisComplete(false);
      setAnalysisError('');
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Analyze Food with AI
  const handleAnalyzeFood = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      // 1. Upload to Firebase Storage: foodImages/{userId}/{timestamp}.jpg
      let storageUrl = null;
      if (capturedBlob && user?.uid) {
        try {
          storageUrl = await foodService.uploadFoodImage(user.uid, capturedBlob);
          setUploadedStorageUrl(storageUrl);
        } catch (uploadErr) {
          console.warn('Storage upload fallback:', uploadErr);
        }
      }

      // 2. Call AI Food Analysis
      const analysisResponse = await foodService.analyzeFoodImage(
        storageUrl || capturedImage,
        user?.uid,
        capturedBlob
      );

      if (analysisResponse.success && analysisResponse.data) {
        const d = analysisResponse.data;
        setFoodName(d.foodName || 'Paneer Rice');
        setPortion(d.portion || '1 plate');
        setCalories(d.calories.toString());
        setProtein(d.protein.toString());
        setCarbs(d.carbs.toString());
        setFat(d.fat.toString());
        setFiber((d.fiber || 5).toString());
        setConfidence(d.confidence || 94);

        const items = Array.isArray(d.items) && d.items.length > 0 ? d.items : [
          {
            foodName: d.foodName || 'Food Item',
            portion: d.portion || '1 serving',
            calories: Number(d.calories) || 0,
            protein: Number(d.protein) || 0,
            carbs: Number(d.carbs) || 0,
            fat: Number(d.fat) || 0
          }
        ];
        setFoodItems(items);
        setAnalysisComplete(true);
        showToast(`Identified ${items.length > 1 ? `${items.length} items (${d.foodName})` : `"${d.foodName}"`}`, 'success');
      } else {
        throw new Error(analysisResponse.message || 'Food could not be identified accurately.');
      }
    } catch (err) {
      console.error('Food analysis error:', err);
      setAnalysisError(err.message || 'Food could not be identified accurately. Please try manual entry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle editing an individual detected food item & recalculate totals
  const handleUpdateItem = (index, field, value) => {
    setFoodItems((prev) => {
      const updated = prev.map((item, idx) => {
        if (idx !== index) return item;
        return {
          ...item,
          [field]: field === 'foodName' || field === 'portion' ? value : Number(value) || 0
        };
      });

      const totCal = updated.reduce((s, it) => s + (Number(it.calories) || 0), 0);
      const totPro = Math.round(updated.reduce((s, it) => s + (Number(it.protein) || 0), 0) * 10) / 10;
      const totCarb = Math.round(updated.reduce((s, it) => s + (Number(it.carbs) || 0), 0) * 10) / 10;
      const totFat = Math.round(updated.reduce((s, it) => s + (Number(it.fat) || 0), 0) * 10) / 10;
      const aggregateName = updated.map((it) => it.foodName).join(' + ');

      setCalories(totCal.toString());
      setProtein(totPro.toString());
      setCarbs(totCarb.toString());
      setFat(totFat.toString());
      setFoodName(aggregateName);

      return updated;
    });
  };

  // Confirm and Add to Dashboard (Saves directly to Firestore users/{userId}/meals)
  const handleAddToDashboard = async () => {
    try {
      const mealDoc = {
        name: foodName.trim() || 'Food Log',
        foodName: foodName.trim() || 'Food Log',
        type: selectedMealType,
        mealType: selectedMealType,
        calories: parseInt(calories, 10) || 450,
        protein: parseInt(protein, 10) || 20,
        carbs: parseInt(carbs, 10) || 50,
        fat: parseInt(fat, 10) || 15,
        fiber: fiber ? Number(fiber) : null,
        portion,
        source: 'camera',
        imageUrl: uploadedStorageUrl || capturedImage || null,
        image: uploadedStorageUrl || capturedImage || null,
        confidence,
        method: 'camera'
      };

      await addMeal(mealDoc);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving meal to Firestore:', err);
      showToast('Failed to save meal to Firestore', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EFFAF5] dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-400 text-xs font-black">
          <Camera className="w-4 h-4" />
          <span>AI Food Photo Analysis</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Snap Your Food
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Capture or upload a meal photo. Our AI identifies food ingredients, portions, calories, and macros with user confirmation.
        </p>
      </div>

      {/* Main Analysis Viewport */}
      <div className="bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-lg relative overflow-hidden space-y-6">
        
        {/* STEP 1: CAMERA STREAM OR IMAGE PREVIEW */}
        <div className="relative w-full aspect-[4/3] max-h-[420px] rounded-3xl bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
          {!capturedImage ? (
            <>
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-3">
                  <Camera className="w-12 h-12 mx-auto stroke-[1.5] text-slate-500" />
                  <p className="text-xs max-w-xs">{cameraError || 'Camera inactive. Click below to start.'}</p>
                  <button
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-bold"
                  >
                    Open Camera
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Captured Meal"
                className="w-full h-full object-cover"
              />
              {/* Scan Laser effect when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-[#087F5B]/20 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                  <div className="bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-black shadow-lg">
                    AI Analyzing Nutrition & Macros...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 2: CAMERA / PREVIEW CONTROLS */}
        {!analysisComplete ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!capturedImage ? (
              <>
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  disabled={!isCameraActive}
                  className="px-6 py-3 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-[#087F5B]/20 flex items-center space-x-2 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span>Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-sm flex items-center space-x-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Image</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isAnalyzing}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center space-x-2 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Photo</span>
                </button>
                <button
                  type="button"
                  onClick={handleAnalyzeFood}
                  disabled={isAnalyzing}
                  className="px-7 py-3 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-extrabold text-sm shadow-lg shadow-[#087F5B]/20 flex items-center space-x-2 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Food</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        ) : null}

        {/* STEP 3: NUTRITION RESULT & USER CONFIRMATION */}
        {analysisComplete && (
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Header info & Section 20 Approximate Warning */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 dark:bg-emerald-950 text-[#087F5B] dark:text-emerald-400">
                  Approximate values • AI Confidence: {confidence}%
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Source: Camera
                </span>
              </div>

              {/* Exact Warning Requirement: Section 20 */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                Nutrition values are estimates and may vary based on portion size, ingredients and preparation.
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {foodName}
                  </h3>
                  <p className="text-xs text-slate-400">Total Portion: {portion}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#087F5B] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#087F5B]" />
                  <span>{isEditing ? 'Done Editing Total' : 'Edit Total'}</span>
                </button>
              </div>
            </div>

            {/* SECTION 6: MULTIPLE FOOD ITEMS BREAKDOWN & INDIVIDUAL ITEM EDITING */}
            {Array.isArray(foodItems) && foodItems.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Detected Items ({foodItems.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click Edit on any item to modify portion or macros
                  </span>
                </div>

                <div className="space-y-2">
                  {foodItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {item.foodName}
                          </h4>
                          <span className="text-xs text-slate-400">
                            Portion: {item.portion} • ~{item.calories} kcal (P: {item.protein}g, C: {item.carbs}g, F: {item.fat}g)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingItemIdx(editingItemIdx === idx ? null : idx)}
                          className="px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#087F5B] transition-colors"
                        >
                          {editingItemIdx === idx ? 'Done' : 'Edit'}
                        </button>
                      </div>

                      {/* Inline Item Edit Form */}
                      {editingItemIdx === idx && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400">Item Name</label>
                            <input
                              type="text"
                              value={item.foodName}
                              onChange={(e) => handleUpdateItem(idx, 'foodName', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400">Portion</label>
                            <input
                              type="text"
                              value={item.portion}
                              onChange={(e) => handleUpdateItem(idx, 'portion', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400">Calories (kcal)</label>
                            <input
                              type="number"
                              value={item.calories}
                              onChange={(e) => handleUpdateItem(idx, 'calories', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400">Protein (g)</label>
                            <input
                              type="number"
                              value={item.protein}
                              onChange={(e) => handleUpdateItem(idx, 'protein', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400">Carbs (g)</label>
                            <input
                              type="number"
                              value={item.carbs}
                              onChange={(e) => handleUpdateItem(idx, 'carbs', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase text-slate-400">Fat (g)</label>
                            <input
                              type="number"
                              value={item.fat}
                              onChange={(e) => handleUpdateItem(idx, 'fat', e.target.value)}
                              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Editable Total Fields or Total Nutrition 4-Grid */}
            {isEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Meal Name</label>
                  <input
                    type="text"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Portion</label>
                  <input
                    type="text"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Protein (g)</label>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Total Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              /* Total Nutrition Cards */
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Total Nutrition
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-slate-800/40 border border-amber-500/20">
                    <span className="text-[10px] font-black uppercase text-amber-600 block">Calories</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{calories}</span>
                    <span className="text-[10px] text-slate-400 block">kcal</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/40 border border-emerald-500/20">
                    <span className="text-[10px] font-black uppercase text-[#087F5B] block">Protein</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{protein}</span>
                    <span className="text-[10px] text-slate-400 block">grams</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-sky-50/70 dark:bg-slate-800/40 border border-sky-500/20">
                    <span className="text-[10px] font-black uppercase text-sky-600 block">Carbs</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{carbs}</span>
                    <span className="text-[10px] text-slate-400 block">grams</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-purple-50/70 dark:bg-slate-800/40 border border-purple-500/20">
                    <span className="text-[10px] font-black uppercase text-purple-600 block">Fat</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{fat}</span>
                    <span className="text-[10px] text-slate-400 block">grams</span>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Log to which meal?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['Breakfast', 'Lunch', 'Evening Snack', 'Dinner'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMealType(cat)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                      selectedMealType === cat
                        ? 'bg-[#087F5B] text-white border-[#087F5B] shadow-md shadow-[#087F5B]/20'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#087F5B]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS: [Edit] and [Add to Dashboard] */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleAddToDashboard}
                className="flex-1 py-3.5 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-extrabold text-sm shadow-xl shadow-[#087F5B]/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Add to Dashboard</span>
              </button>
              <button
                type="button"
                onClick={handleRetake}
                className="px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {analysisError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center justify-between">
            <span>{analysisError}</span>
            <button
              onClick={() => navigate('/log-meal')}
              className="underline font-bold ml-2 shrink-0"
            >
              Manual Entry
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
