# 🛒 ScanPay - Smart Checkout & Health-First Retail Solution

![Status](https://img.shields.io/badge/Status-Live-success)
![Event](https://img.shields.io/badge/Walmart_Sparkathon-2025-blue)
![Stack](https://img.shields.io/badge/Tech-React_|_Vite_|_Firebase-orange)

**ScanPay** is an end-to-end smart checkout and health-first meal planning solution built for Walmart customers and staff. It leverages AI to enable hyper-efficient scanning while integrating personalized nutrition goals into the shopping experience.

> **Slogan:** Faster checkouts. Healthier customers. Smarter Walmart.

---

## 🔗 Links

- **🚀 Live Website:** [scan-and-pay-9cx4.vercel.app](https://scan-and-pay-9cx4.vercel.app/)
- **🎥 Demo Video:** [Watch on YouTube](https://www.youtube.com/watch?v=ro5XfQh_K6g)

---

## 🌟 Key Features

### For Customers
- **📱 Multi-Item AI Scanning:** Scan multiple items instantly using your smartphone camera for a 60% faster checkout.
- **🍽️ Health-First Meal Planning:** Choose from 500+ dietary-specific recipes (Diabetic, Vegan, Gluten-free) and generate instant grocery lists.
- **🧠 Personalized Recommendations:** AI-driven product suggestions based on health goals and cart contents.
- **🛒 Virtual Cart:** Real-time pricing and product recognition—no queues.

### For Staff & Walmart
- **🛡️ Risk Scoring System:** Intelligent analysis of cart behavior to flag high-risk transactions and reduce shrinkage.
- **📊 Real-Time Dashboard:** Monitor store throughput, inventory trends, and staff efficiency.
- **📉 Reduced Shrinkage:** Smart alerts for manual verification only when necessary.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, PostCSS
- **Backend/BaaS:** Firebase (Firestore, Auth, Storage)
- **State Management:** React Context API
- **Linting:** ESLint

---

## 📂 Project Structure

```text
SCANPAY/
├── .vite/                # Vite cache
├── public/               # Static assets
├── src/
│   ├── assets/           # Images and icons
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── pages/            # App page views
│   ├── services/         # API and Firebase services
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── .env                  # Environment variables
├── firebase-merged-final.json # Database seed data
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
🚀 Getting Started
Follow these steps to set up the project locally.

Prerequisites
Node.js (v16 or higher)

npm or yarn

Installation
Clone the repository

Bash

git clone [https://github.com/your-username/scanpay.git](https://github.com/your-username/scanpay.git)
cd scanpay
Install dependencies

Bash

npm install
Environment Setup Create a .env file in the root directory. You can use the example keys below (replace with your actual Firebase config):

Code snippet

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Run the Development Server

Bash

npm run dev
Open http://localhost:5173 (or the port shown in your terminal) to view the app.

Building for Production
To create a production build:

Bash

npm run build
👥 Team: IT ALCHEMISTS
Walmart Sparkathon 2025 Submission
