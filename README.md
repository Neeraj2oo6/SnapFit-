# SnapFit

AI-Powered Nutrition and Food Tracking Application built with React, Vite, and Firebase.

SnapFit provides automated food logging, macronutrient tracking, real-time hydration monitoring, barcode scanning, and AI-driven coaching insights to help users meet their health and fitness goals.

---

## Features

- **React + Vite Frontend**: High-performance, reactive single-page interface powered by modern React 18, Tailwind CSS, and Framer Motion.
- **Firebase Authentication**: Secure user registration, login, and session persistence across browser sessions.
- **Cloud Firestore Integration**: Real-time cloud synchronization for user profiles, meals, daily nutrition goals, water logs, and streak tracking.
- **Firebase Storage Integration**: Cloud storage for meal images and user avatars.
- **AI Food Photo Analysis**: Analyze uploaded food photos to recognize meal items, estimate portion sizes, and calculate macro breakdowns.
- **AI Food Chat / Coach**: Interactive nutrition assistant providing contextual meal advice, macro suggestions, and dietary recommendations.
- **Barcode Scanner**: Quick barcode scanning to look up packaged foods and log instant nutritional data.
- **Nutrition Tracking**: Detailed macro and micronutrient monitoring (Calories, Protein, Carbs, Fats, Fiber).
- **Water Logging**: Real-time hydration counter with daily target tracking and visual reminders.
- **Meal History**: Chronological log of breakfast, lunch, dinner, and snacks with breakdown summaries.
- **Responsive Dashboard**: Data visualizations with interactive charts (Recharts) and motivational health metrics.

---

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React, Framer Motion, Recharts
- **Backend / Services**: Node.js, Express, Firebase SDK (Auth, Firestore, Storage)
- **AI & Computer Vision**: OpenAI / Vision API endpoints for nutritional recognition and AI coaching
- **Database**: Cloud Firestore & Optional MySQL backend schema for hybrid deployments

---

## Installation

Clone the repository and install the project dependencies:

```bash
npm install
```

For the optional Express backend (if running the full-stack service):

```bash
cd backend
npm install
cd ..
```

---

## Environment Setup

Create a `.env` file in the root directory by copying the template provided in `.env.example`:

```bash
cp .env.example .env
```

Populate the environment variables with your genuine Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_BACKEND_URL=http://localhost:5000
```

> **Security Notice**: 
> - Never commit your `.env` file or private credentials to GitHub.
> - Private AI API keys (e.g. OpenAI secret keys) and service account credentials should only be stored securely in the backend server environment (`backend/.env`), never exposed directly in frontend client code.

---

## Run Locally

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

To start the optional backend server concurrently:

```bash
cd backend
npm run dev
```

---

## Build for Production

Generate an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## License

This project is licensed under the MIT License.
