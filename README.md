# AI Clinical Simulation Assistant

An interactive, AI-powered virtual hospital simulation environment designed for university healthcare students in **Medicine**, **Pharmacy**, and **Nursing**. Students can practice taking medical histories, assessing symptoms, ordering diagnostic laboratory tests, formulating evidence-based treatment plans, and receiving structured educational feedback based on OSCE (Objective Structured Clinical Examination) standards.

---

## 🚀 Quick Start on GitHub

### Option A: Run Directly in GitHub Codespaces (No local installation needed)

1. Open your repository on **GitHub**.
2. Click the green **Code** button and select the **Codespaces** tab.
3. Click **Create codespace on main**.
4. Once the terminal opens, create your `.env` file:
   ```bash
   cp .env.example .env
   ```
5. Add your Google Gemini API Key to `.env`:
   ```bash
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
   *(You can obtain a free API key at [Google AI Studio](https://aistudio.google.com/))*
6. Run the application:
   ```bash
   npm run dev
   ```
7. Click **Open in Browser** when the port forward notification appears (running on `http://localhost:3000`).

---

### Option B: Run Locally on Your Machine

#### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Git**

#### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/ai-clinical-simulation-assistant.git
   cd ai-clinical-simulation-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   Open `.env` in your text editor and provide your Gemini API key:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key_here"
   PORT=3000
   ```
   *(Note: The simulator includes robust offline clinical fallbacks, so the simulation will still work even without an API key!)*

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express full-stack server with Vite middleware in development mode on port 3000. |
| `npm run build` | Compiles the production React frontend bundle into the `dist/` directory. |
| `npm start` | Runs the full-stack server in production mode (serves `dist/` and API endpoints). |
| `npm run lint` | Runs the TypeScript compiler (`tsc --noEmit`) to validate type safety. |

---

## 🏥 Features & Learning Modules

- **Multimorbid Virtual Patient Generator**:
  - Realistic virtual patient cases with complex medical histories, multiple chronic comorbidities (e.g., hypertension, diabetes, smoking), multidrug allergies, and Social Determinants of Health (SDOH: transportation barriers, food deserts, fixed pensions).
  - Dynamic AI case generator to customize complexity, department, and clinical topics.
- **Interactive Patient Chat**:
  - Conversational bedside history taking where patients reveal symptoms, pain characteristics, and living situations when prompted.
  - Realistic emotion, lay language, and built-in text-to-speech synthesis.
- **Three Core Learning Departments**:
  - 🩺 **Medicine**: Differential diagnoses, red flag screening, and holistic SDOH barrier action planning.
  - 💊 **Pharmacy**: Prescription screening, drug-drug interaction detection, allergy contraindication holds, and patient counselling points.
  - 🩺 **Nursing**: Morse fall risk, Braden pressure ulcer score, NANDA-I priority nursing diagnoses, and structured interprofessional SBAR handovers.
- **OSCE AI Debrief & Scoring**:
  - Structured evaluation across communication, clinical reasoning, patient safety, and SDOH inquiry.
  - High-acuity safety alerts and comprehensive clinical rationale.

---

## 🌐 Deploying to the Cloud from GitHub

This full-stack application can be deployed to any platform supporting Node.js:

### Deploying to Render / Railway / Fly.io
1. Connect your GitHub repository to your host.
2. Set the build command:
   ```bash
   npm install && npm run build
   ```
3. Set the start command:
   ```bash
   npm start
   ```
4. Add the environment variable:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `NODE_ENV`: `production`

---

## 🛡️ Educational Safety Disclaimer
This software is designed exclusively for healthcare education, OSCE training, and academic simulation. All patient identities, histories, and clinical cases are fictional. It is not intended for real-world clinical decision making, diagnosis, or prescription.
