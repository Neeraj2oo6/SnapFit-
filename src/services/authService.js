import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebase';

/**
 * Calculates scientifically estimated daily calorie and macro goals (Mifflin-St Jeor formula)
 */
export const calculateUserTargets = (weightKg = 70, heightCm = 175, age = 22, gender = 'Male', goal = 'Build Muscle', activityLevel = 'Moderate') => {
  const w = Number(weightKg) || 70;
  const h = Number(heightCm) || 175;
  const a = Number(age) || 22;

  // BMR
  let bmr = 10 * w + 6.25 * h - 5 * a;
  if (gender === 'Male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity Multiplier
  const multipliers = {
    'Sedentary': 1.2,
    'Light': 1.375,
    'Moderate': 1.55,
    'Very Active': 1.725
  };
  const mult = multipliers[activityLevel] || 1.4;
  let tdee = Math.round(bmr * mult);

  // Goal adjustment
  if (goal === 'Lose Weight' || goal === 'Weight Loss') {
    tdee = Math.max(1300, tdee - 450);
  } else if (goal === 'Build Muscle') {
    tdee += 300;
  }

  // Macro splits
  const proteinGrams = Math.round(w * 1.8);
  const fatGrams = Math.round((tdee * 0.25) / 9);
  const carbsGrams = Math.round((tdee - (proteinGrams * 4 + fatGrams * 9)) / 4);

  return {
    dailyCalorieGoal: tdee,
    proteinTargetGrams: proteinGrams,
    carbsTargetGrams: Math.max(100, carbsGrams),
    fatTargetGrams: Math.max(40, fatGrams),
    waterTargetMl: 2500
  };
};

// Formats Firebase error codes into friendly user messages
export const getFriendlyAuthErrorMessage = (err) => {
  if (!err) return 'An unexpected error occurred.';
  const code = err.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again in a few minutes.';
    case 'auth/configuration-not-found':
      return 'Email/Password provider is not yet enabled in Firebase Console. Please enable Email/Password under Authentication -> Sign-in method in your Firebase Console.';
    default:
      return err.message || 'Authentication failed. Please try again.';
  }
};

export const authService = {
  /**
   * Register a new user in Firebase Auth and create their initial Firestore user profile document
   */
  async register(name, email, password) {
    if (!isFirebaseConfigured) {
      console.warn('Firebase configuration missing. Using local user registration.');
      const userObj = {
        uid: 'demo_user_' + Date.now(),
        fullName: name,
        name,
        email,
        fitPoints: 100,
        streakDays: 1,
        onboardingCompleted: false
      };
      localStorage.setItem('snapfit_user', JSON.stringify(userObj));
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('snapfit_last_registered_email', email);
      localStorage.setItem('onboardingCompleted', 'false');
      return { user: userObj };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase Auth displayName
      await updateProfile(user, { displayName: name });

      // Create initial user document in Firestore: users/{userId} with onboardingCompleted: false
      const userDocRef = doc(db, 'users', user.uid);
      const userDocData = {
        uid: user.uid,
        fullName: name,
        name,
        email,
        fitPoints: 100,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        onboardingCompleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(userDocRef, userDocData);

      localStorage.setItem('snapfit_last_registered_email', email);
      localStorage.setItem('user', JSON.stringify(userDocData));
      localStorage.setItem('snapfit_user', JSON.stringify(userDocData));
      localStorage.setItem('onboardingCompleted', 'false');

      return { user: userDocData };
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  },

  /**
   * Save complete 4-step onboarding data to Firestore users/{userId}
   */
  async saveOnboardingData(userId, onboardingData) {
    if (!userId) throw new Error('User ID is required to save onboarding data.');

    const {
      profile = {},
      routine = {},
      mealTimes = {},
      activityLevel = 'Moderate'
    } = onboardingData;

    const occupationRaw = profile.role || profile.occupation || 'Student';
    const occupation = occupationRaw === 'Working Professional' ? 'working_professional' : 'student';

    const goalRaw = profile.goal || 'Build Muscle';
    const goalNorm = goalRaw.toLowerCase().replace(/\s+/g, '_');

    const genderRaw = profile.gender || 'Prefer not to say';
    const genderNorm = genderRaw.toLowerCase().replace(/\s+/g, '_');

    const actRaw = typeof activityLevel === 'string' ? activityLevel : (activityLevel?.level || 'Moderate');
    const actNorm = actRaw.toLowerCase().replace(/\s+/g, '_');

    const targets = calculateUserTargets(
      profile.weightKg || 70,
      profile.heightCm || 175,
      profile.age || 22,
      genderRaw === 'Female' ? 'Female' : 'Male',
      goalRaw,
      actRaw
    );

    const onboardingPayload = {
      profile: {
        occupation,
        goal: goalNorm,
        gender: genderNorm
      },
      routine: {
        startTime: routine.startTime || routine.collegeStartTime || routine.workStartTime || '09:00',
        endTime: routine.endTime || routine.collegeEndTime || routine.workEndTime || '17:00',
        studyWorkTime: routine.studyWorkTime || '19:00 - 22:30',
        sleepTime: routine.sleepTime || '23:30'
      },
      mealTimes: {
        breakfast: mealTimes.breakfast || '08:00',
        lunch: mealTimes.lunch || '13:30',
        eveningSnack: mealTimes.eveningSnack || '17:30',
        dinner: mealTimes.dinner || '20:30'
      },
      activityLevel: actNorm,
      goal: goalRaw,
      gender: genderRaw,
      ...targets,
      onboardingCompleted: true
    };

    if (!isFirebaseConfigured) {
      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...saved, ...onboardingPayload };
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('snapfit_user', JSON.stringify(updated));
      localStorage.setItem('onboardingCompleted', 'true');
      return updated;
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        ...onboardingPayload,
        updatedAt: serverTimestamp()
      }, { merge: true });

      const snap = await getDoc(userDocRef);
      const data = { uid: userId, ...snap.data(), onboardingCompleted: true };
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('snapfit_user', JSON.stringify(data));
      localStorage.setItem('onboardingCompleted', 'true');
      return data;
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  },

  /**
   * Log in user with Firebase Auth and fetch profile document from Firestore
   */
  async login(email, password) {
    if (!isFirebaseConfigured) {
      console.warn('Firebase configuration missing. Using local user session.');
      const saved = localStorage.getItem('user') || localStorage.getItem('snapfit_user');
      const userObj = saved ? JSON.parse(saved) : {
        uid: 'demo_user_1',
        fullName: email.split('@')[0],
        name: email.split('@')[0],
        email,
        goal: 'Build Muscle',
        dailyCalorieGoal: 2200,
        proteinTargetGrams: 120,
        carbsTargetGrams: 220,
        fatTargetGrams: 65,
        waterTargetMl: 2500,
        fitPoints: 650,
        streakDays: 5,
        onboardingCompleted: true
      };
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('snapfit_user', JSON.stringify(userObj));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('onboardingCompleted', String(Boolean(userObj.onboardingCompleted)));
      return { user: userObj };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user doc from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      let userProfile = null;
      if (docSnap.exists()) {
        const rawData = docSnap.data();
        // Safe onboarding check: true only if explicitly completed, or legacy account with full targets
        const isDone = rawData.onboardingCompleted === true ||
          (rawData.onboardingCompleted === undefined && Boolean(rawData.goal && rawData.dailyCalorieGoal));

        userProfile = {
          uid: user.uid,
          ...rawData,
          onboardingCompleted: isDone
        };
      } else {
        // Create initial doc if it didn't exist, with onboardingCompleted: false
        userProfile = {
          uid: user.uid,
          fullName: user.displayName || email.split('@')[0],
          name: user.displayName || email.split('@')[0],
          email: user.email,
          fitPoints: 100,
          streakDays: 1,
          lastActiveDate: new Date().toISOString().split('T')[0],
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await setDoc(userDocRef, userProfile);
      }

      localStorage.setItem('user', JSON.stringify(userProfile));
      localStorage.setItem('snapfit_user', JSON.stringify(userProfile));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('onboardingCompleted', String(userProfile.onboardingCompleted));

      return { user: userProfile };
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email) {
    if (!isFirebaseConfigured) return true;
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  },

  /**
   * Log out of Firebase Auth
   */
  async logout() {
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Logout notice:', err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('snapfit_user');
      localStorage.setItem('isLoggedIn', 'false');
    }
  },

  /**
   * Listen to Firebase Auth state
   */
  onAuthStateChange(callback) {
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem('user');
      callback(saved ? JSON.parse(saved) : null);
      return () => {};
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const rawData = docSnap.data();
            const isDone = rawData.onboardingCompleted === true ||
              (rawData.onboardingCompleted === undefined && Boolean(rawData.goal && rawData.dailyCalorieGoal));
            const data = {
              uid: firebaseUser.uid,
              ...rawData,
              onboardingCompleted: isDone
            };
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('snapfit_user', JSON.stringify(data));
            localStorage.setItem('onboardingCompleted', String(isDone));
            callback(data);
          } else {
            callback({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'SnapFit User',
              fullName: firebaseUser.displayName || 'SnapFit User',
              onboardingCompleted: false
            });
          }
        } catch (err) {
          console.warn('Failed to load user profile on auth change:', err);
          callback({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'SnapFit User',
            fullName: firebaseUser.displayName || 'SnapFit User',
            onboardingCompleted: false
          });
        }
      } else {
        callback(null);
      }
    });
  },

  /**
   * Update Firestore user profile
   */
  async updateProfile(userId, profileFields) {
    if (!userId) throw new Error('User ID is required to update profile.');
    
    if (!isFirebaseConfigured) {
      const saved = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...saved, ...profileFields };
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('snapfit_user', JSON.stringify(updated));
      return updated;
    }

    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        ...profileFields,
        updatedAt: serverTimestamp()
      });
      const snap = await getDoc(userDocRef);
      const data = { uid: userId, ...snap.data() };
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('snapfit_user', JSON.stringify(data));
      return data;
    } catch (err) {
      throw new Error(getFriendlyAuthErrorMessage(err));
    }
  },

  getCurrentUser() {
    const saved = localStorage.getItem('user') || localStorage.getItem('snapfit_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};
