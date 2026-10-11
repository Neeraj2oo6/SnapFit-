import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebase';
import { BARCODE_DATABASE } from '../data/mockMeals';
import { nutritionService } from './nutritionService';

export const barcodeService = {
  /**
   * Look up product nutrition information by barcode.
   * Hybrid system:
   * 1. Public OpenFoodFacts product database API
   * 2. Local verified barcode database
   * 3. AI / nutrition estimation fallback
   * 4. Saves scan record in users/{userId}/barcodeHistory
   */
  async lookupBarcode(barcode, userId = null) {
    const cleanBarcode = (barcode || '').trim();
    if (!cleanBarcode) {
      throw new Error('Barcode is required.');
    }

    let productData = null;

    // 1. Try public OpenFoodFacts international API
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanBarcode)}.json`);
      if (response.ok) {
        const json = await response.json();
        if (json.status === 1 && json.product) {
          const p = json.product;
          const nutriments = p.nutriments || {};

          const calories = Math.round(
            nutriments['energy-kcal_serving'] ||
            nutriments['energy-kcal_100g'] ||
            (nutriments['energy_100g'] ? nutriments['energy_100g'] / 4.184 : 200)
          );
          const protein = Math.round(Number(nutriments.proteins_serving || nutriments.proteins_100g || 10) * 10) / 10;
          const carbs = Math.round(Number(nutriments.carbohydrates_serving || nutriments.carbohydrates_100g || 20) * 10) / 10;
          const fat = Math.round(Number(nutriments.fat_serving || nutriments.fat_100g || 5) * 10) / 10;
          const fiber = nutriments.fiber_serving != null || nutriments.fiber_100g != null
            ? Math.round(Number(nutriments.fiber_serving || nutriments.fiber_100g) * 10) / 10
            : null;
          const sugar = nutriments.sugars_serving != null || nutriments.sugars_100g != null
            ? Math.round(Number(nutriments.sugars_serving || nutriments.sugars_100g) * 10) / 10
            : null;
          const sodium = nutriments.sodium_serving != null || nutriments.sodium_100g != null
            ? Math.round(Number(nutriments.sodium_serving || nutriments.sodium_100g) * 1000)
            : null;
          const serving = p.serving_size || '1 package (100g)';
          const name = p.product_name || p.product_name_en || `Scanned Product (${cleanBarcode})`;

          productData = {
            barcode: cleanBarcode,
            foodName: name,
            name,
            brand: p.brands || 'Packaged Product',
            portion: serving,
            servingSize: serving,
            calories: Math.max(0, calories),
            protein: Math.max(0, protein),
            carbs: Math.max(0, carbs),
            fat: Math.max(0, fat),
            fiber,
            sugar,
            sodium,
            imageUrl: p.image_url || p.image_front_url || null,
            image: p.image_url || p.image_front_url || null,
            confidence: 96,
            isEstimated: false,
            source: 'verified_database'
          };
        }
      }
    } catch (err) {
      console.warn('OpenFoodFacts API query notice:', err.message);
    }

    // 2. Check local verified barcode database
    if (!productData && BARCODE_DATABASE[cleanBarcode]) {
      const p = BARCODE_DATABASE[cleanBarcode];
      productData = {
        barcode: cleanBarcode,
        foodName: p.name,
        name: p.name,
        brand: p.brand || 'SnapFit Verified',
        portion: p.servingSize || '1 serving',
        servingSize: p.servingSize || '1 serving',
        calories: Number(p.calories) || 200,
        protein: Number(p.protein) || 15,
        carbs: Number(p.carbs) || 20,
        fat: Number(p.fat) || 5,
        imageUrl: p.image || null,
        image: p.image || null,
        confidence: 95,
        isEstimated: false,
        source: 'barcode'
      };
    }

    // 3. AI / Heuristic fallback for common products if code is recognized
    if (!productData) {
      const aiEstimate = await nutritionService.lookupFoodItem(cleanBarcode);
      if (aiEstimate) {
        productData = {
          barcode: cleanBarcode,
          foodName: aiEstimate.name,
          name: aiEstimate.name,
          brand: 'Packaged Food',
          portion: aiEstimate.defaultPortion || '1 serving',
          servingSize: aiEstimate.defaultPortion || '1 serving',
          calories: aiEstimate.calories,
          protein: aiEstimate.protein,
          carbs: aiEstimate.carbs,
          fat: aiEstimate.fat,
          imageUrl: null,
          image: null,
          confidence: 80,
          isEstimated: true,
          source: 'barcode'
        };
      }
    }

    // 4. Save to user's barcodeHistory subcollection in Firestore if authenticated
    if (productData && userId && isFirebaseConfigured && db) {
      try {
        const historyRef = collection(db, 'users', userId, 'barcodeHistory');
        await addDoc(historyRef, {
          barcode: cleanBarcode,
          foodName: productData.foodName,
          portion: productData.portion,
          calories: productData.calories,
          protein: productData.protein,
          carbs: productData.carbs,
          fat: productData.fat,
          createdAt: serverTimestamp()
        });
      } catch (saveErr) {
        console.warn('Could not record barcode scan in barcodeHistory:', saveErr.message);
      }
    }

    return productData;
  }
};
