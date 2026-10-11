import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Camera,
  Package,
  Edit2
} from 'lucide-react';
import { useHealth } from '../hooks/useHealth';
import { useAuth } from '../hooks/useAuth';
import { barcodeService } from '../services/barcodeService';

export const BarcodeScannerPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addMeal, showToast } = useHealth();

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('890123456789');
  const [productResult, setProductResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Snack');

  // Manual Entry Form State (when product is not found)
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualServing, setManualServing] = useState('1 bar');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  // Start live camera for scanning
  useEffect(() => {
    let currentStream = null;

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 } },
          audio: false
        });
        currentStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        setCameraActive(true);

        // Native BarcodeDetector API if supported in browser
        if ('BarcodeDetector' in window) {
          const detector = new window.BarcodeDetector({ formats: ['ean_13', 'upc_a', 'qr_code', 'code_128'] });
          const interval = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes && barcodes.length > 0) {
                  const rawValue = barcodes[0].rawValue;
                  handleLookupCode(rawValue);
                }
              } catch (e) {}
            }
          }, 800);
          return () => clearInterval(interval);
        }
      } catch (err) {
        console.warn('Barcode camera preview notice:', err);
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Lookup barcode function
  const handleLookupCode = async (code) => {
    if (!code || !code.trim()) return;
    const cleanCode = code.trim();
    setIsScanning(true);
    setShowManualEntry(false);

    try {
      const product = await barcodeService.lookupBarcode(cleanCode, user?.uid);
      if (product) {
        setProductResult(product);
        setNotFound(false);
        showToast(`Identified "${product.foodName}"`, 'success');
      } else {
        setProductResult(null);
        setNotFound(true);
        showToast('Product nutrition information could not be verified. Enter details manually.', 'warning');
      }
    } catch (err) {
      console.warn('Barcode lookup notice:', err.message);
      setProductResult(null);
      setNotFound(true);
      showToast('Product nutrition information could not be verified.', 'warning');
    } finally {
      setIsScanning(false);
    }
  };

  // Add confirmed barcode product to Dashboard
  const handleAddProductToDashboard = async () => {
    if (!productResult) return;

    try {
      await addMeal({
        name: productResult.foodName,
        foodName: productResult.foodName,
        portion: productResult.portion || productResult.servingSize || '1 package',
        calories: Number(productResult.calories) || 0,
        protein: Number(productResult.protein) || 0,
        carbs: Number(productResult.carbs) || 0,
        fat: Number(productResult.fat) || 0,
        ...(productResult.fiber != null && { fiber: Number(productResult.fiber) }),
        ...(productResult.sugar != null && { sugar: Number(productResult.sugar) }),
        ...(productResult.sodium != null && { sodium: Number(productResult.sodium) }),
        ...(productResult.confidence != null && { confidence: Number(productResult.confidence) }),
        mealType: selectedCategory,
        type: selectedCategory,
        source: 'verified_database',
        imageUrl: productResult.imageUrl || productResult.image || null,
        method: 'barcode'
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving barcode meal:', err);
      showToast('Failed to save meal to Dashboard', 'error');
    }
  };

  // Save manual entry to Dashboard
  const handleSaveManualEntry = async (e) => {
    e.preventDefault();
    if (!manualName.trim()) {
      showToast('Please enter a food name', 'warning');
      return;
    }

    try {
      await addMeal({
        name: manualName.trim(),
        foodName: manualName.trim(),
        portion: manualServing.trim() || '1 serving',
        calories: Number(manualCalories) || 0,
        protein: Number(manualProtein) || 0,
        carbs: Number(manualCarbs) || 0,
        fat: Number(manualFat) || 0,
        mealType: selectedCategory,
        type: selectedCategory,
        source: 'barcode',
        method: 'barcode'
      });

      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving manual meal:', err);
      showToast('Failed to save manual meal to Dashboard', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-black">
          <QrCode className="w-4 h-4" />
          <span>BARCODE SCANNER</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Package Nutrition Scanner
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Scan the barcode of packaged food or enter the barcode number to verify calories and macronutrients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left: Camera Preview & Code Input */}
        <div className="md:col-span-6 bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5">
          <div className="relative w-full aspect-[4/3] rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-slate-800 shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-400">
                <QrCode className="w-12 h-12 stroke-[1.5] mx-auto text-slate-600" />
                <p className="text-xs font-bold text-slate-300">Camera preview ready</p>
                <p className="text-[10px] text-slate-500">Align barcode or enter number below</p>
              </div>
            )}

            {/* Scan Frame Bounding Box */}
            <div className="absolute inset-8 sm:inset-10 border-2 border-[#087F5B] rounded-2xl flex flex-col justify-between p-3 pointer-events-none shadow-[0_0_20px_rgba(8,127,91,0.3)]">
              <div className="flex justify-between w-full">
                <div className="w-5 h-5 border-t-4 border-l-4 border-[#087F5B] rounded-tl" />
                <div className="w-5 h-5 border-t-4 border-r-4 border-[#087F5B] rounded-tr" />
              </div>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#087F5B] to-transparent shadow-[0_0_15px_#087F5B] animate-scan" />
              <div className="flex justify-between w-full">
                <div className="w-5 h-5 border-b-4 border-l-4 border-[#087F5B] rounded-bl" />
                <div className="w-5 h-5 border-b-4 border-r-4 border-[#087F5B] rounded-br" />
              </div>
            </div>

            <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-extrabold shadow">
                Align barcode within frame
              </span>
            </div>
          </div>

          {/* Enter Barcode Manually Section */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-400">
              Enter Barcode Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="e.g. 890123456789"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm font-bold text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleLookupCode(barcodeInput)}
                disabled={isScanning}
                className="px-5 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
              >
                {isScanning ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick test sample codes */}
            <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-400 pt-1">
              <span>Test samples:</span>
              <button
                type="button"
                onClick={() => {
                  setBarcodeInput('890123456789');
                  handleLookupCode('890123456789');
                }}
                className="text-[#087F5B] dark:text-emerald-400 hover:underline"
              >
                Protein Shake
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setBarcodeInput('8901030000000');
                  handleLookupCode('8901030000000');
                }}
                className="text-[#087F5B] dark:text-emerald-400 hover:underline"
              >
                Almond Milk
              </button>
            </div>
          </div>
        </div>

        {/* Right: Product Result or Manual Entry */}
        <div className="md:col-span-6 bg-white dark:bg-[#14213D] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
          {productResult ? (
            <div className="space-y-6">
              {/* Product Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                    {productResult.imageUrl ? (
                      <img src={productResult.imageUrl} alt={productResult.foodName} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-7 h-7 text-[#087F5B]" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#087F5B] dark:text-emerald-400">
                      {productResult.brand || 'Packaged Product'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {productResult.foodName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Serving: {productResult.portion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nutrition 4-Grid */}
              <div className="grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Calories</span>
                  <p className="text-base font-black text-amber-500">{productResult.calories}</p>
                  <span className="text-[9px] text-slate-400">kcal</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Protein</span>
                  <p className="text-base font-black text-[#087F5B] dark:text-emerald-400">{productResult.protein}g</p>
                  <span className="text-[9px] text-slate-400">g</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Carbs</span>
                  <p className="text-base font-black text-sky-500">{productResult.carbs}g</p>
                  <span className="text-[9px] text-slate-400">g</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Fat</span>
                  <p className="text-base font-black text-purple-500">{productResult.fat}g</p>
                  <span className="text-[9px] text-slate-400">g</span>
                </div>
              </div>

              {/* Meal Category Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">Add to Meal:</span>
                <div className="grid grid-cols-4 gap-2">
                  {['Snack', 'Breakfast', 'Lunch', 'Dinner'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                        selectedCategory === cat
                          ? 'bg-[#087F5B] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button: Add to Dashboard */}
              <button
                type="button"
                onClick={handleAddProductToDashboard}
                className="w-full py-3.5 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-sm shadow-lg shadow-[#087F5B]/25 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Add to Dashboard</span>
              </button>
            </div>
          ) : notFound || showManualEntry ? (
            /* Manual Entry Form when Product Not Found */
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <h4 className="text-sm font-bold">Product nutrition information could not be verified</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This product could not be verified in the nutrition database. You can enter its nutrition details manually below:
              </p>

              <form onSubmit={handleSaveManualEntry} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Product / Food Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Protein Bar, Oatmeal Bowl"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Serving / Portion</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 bar (60g), 1 bottle"
                    value={manualServing}
                    onChange={(e) => setManualServing(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Calories</label>
                    <input
                      type="number"
                      required
                      placeholder="kcal"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Protein (g)</label>
                    <input
                      type="number"
                      required
                      placeholder="g"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Carbs (g)</label>
                    <input
                      type="number"
                      required
                      placeholder="g"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fat (g)</label>
                    <input
                      type="number"
                      required
                      placeholder="g"
                      value={manualFat}
                      onChange={(e) => setManualFat(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-[#087F5B] hover:bg-[#056B4A] text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Add to Dashboard</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Ready to scan initial prompt */
            <div className="text-center py-12 space-y-3 text-slate-400">
              <Package className="w-12 h-12 stroke-[1.5] mx-auto text-[#087F5B]" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Ready to Scan</h4>
              <p className="text-xs max-w-xs mx-auto">
                Position your package barcode inside the frame or enter numbers above to view verified ingredients and macros.
              </p>
              <button
                type="button"
                onClick={() => setShowManualEntry(true)}
                className="text-xs font-bold text-[#087F5B] hover:underline pt-2 block mx-auto"
              >
                Or Enter Food Manually →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerPage;
