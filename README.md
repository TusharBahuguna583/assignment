# Signal Decoder

An interactive memory-logic game built with **React + TypeScript**. Players memorize flashing patterns and then try to reproduce them. Includes scoring, hints, dark/light theme toggle, and more.

[▶️ Live Demo](https://signal-decoder-tushar.vercel.app/)

---

## 🔧 Features

- Multi-level gameplay (levels 1–5)  
- Flashing pattern + guessing grid  
- Scoring: +2 for correct full pattern, –1 for wrong guess  
- Hints when guess is wrong, with retry allowed  
- Light / Dark theme toggle  
- Responsive UI (works on desktop and mobile)  
- Stores “best score” in `localStorage`  

---

## 🚀 Running Locally

```sh
git clone https://github.com/TusharBahuguna583/signal-decoder.git
cd signal-decoder
npm install
npm run dev   # or npm start, depending on your setup
