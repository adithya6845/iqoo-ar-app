# 🚀 TechQuest — Team Submission

## 👥 Team
- **Team name:** Code Dynamics
- **Members:** Adithya kumar, D.Harshavardhan, Brindha
- **City / Venue:** Bangalore

## 🎯 App
- **App name:** MedTwin AR
- **Theme:** Healthcare (Utility app / Learning tool)
- **One-liner:** An augmented reality healthcare companion that provides interactive medical guidance and 3D visual support.

**What we built:**
MedTwin AR is an interactive healthcare application designed to assist users with clear, AR-guided medical instructions. It bridges the gap between physical health scenarios and digital assistance, making it easier to understand complex medical emergency procedures (CPR Training, Bleeding Control) and anatomical digital twins through augmented reality overlays, interactive 3D spatial simulations, and AI-driven clinical insights.

**How the AI is used:**
- **Model:** `openai/gpt-4o-mini` (via OpenRouter)
- **What the AI does:** Analyzes user queries and generates context-aware medical guidance, interactive AR instruction steps, clinical analysis, and health insights based on the situation.
- **AI pattern:** Chat · Classify · Generate

## ▶️ How to run it

### 1. Clone (your fork)
```bash
git clone https://github.com/adithya6845/TechQuest.git
cd TechQuest
```

### 2. Add your OpenRouter key as described below, then open the project
*(Let all dependencies finish syncing before you run)*

**OpenRouter setup**
- **Base URL:** `https://openrouter.ai/api/v1`
- **Model:** `openai/gpt-4o-mini`
- **API key:** Stored locally in a `.env` or `local.properties` file — never committed!

**Run Web / Dev Server**
```bash
npm install
npm run dev
```

**Build the APK / Production App**
- Android Studio → Build → Build Bundle(s)/APK(s) → Build APK(s)
- Output: `app/build/outputs/apk/debug/app-debug.apk`

*(Alternatively, run `eas build -p android --profile preview` or `npx expo start` for the Expo version).*

## 📱 Demo
- **Live Web App:** [https://iqoo-ar-app.vercel.app](https://iqoo-ar-app.vercel.app)
- **APK:** *(Point to app-debug.apk in the repo / releases)*
- **Screen recording:** *(Add link to a short video of the app running on the iQOO)*
- **Screenshots:** MedTwin AR CPR & Bleeding 3D Simulation with Real-time Camera AR Stream

## 🧰 Tech stack
- **Frontend / Mobile:** React Native / Expo / Vite / React 18
- **3D & AR Rendering:** Three.js, WebGL, Real-time Camera Stream Overlay
- **AI & LLM:** OpenRouter API (`openai/gpt-4o-mini`)
- **Styling & UI:** Modern Glassmorphism & Micro-animations (Lucide Icons, Tailwind-like design tokens)
- **Audio:** Web Speech Synthesis API & Sound Feedback Engine

## ✅ Submission checklist
- [x] This README is filled in (team, theme, how to run)
- [x] The API key is NOT in the repo (see .gitignore)
- [x] Final code pushed to your fork
- [ ] APK and/or a screen recording added or linked
- [ ] Pull Request opened from your fork → Reskilll/TechQuest before the deadline
- [x] PR title = Code Dynamics

---
*Built at TechQuest · AI Tech Workshop — iQOO Connect × Reskilll.*