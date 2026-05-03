# LAMESE AI — Disease Prediction System

AI-powered health analysis system that processes user inputs (symptoms, age, sex, lifestyle, and medical data) to generate possible diagnoses, a health score, explanations, and recommendations.

> ⚠️ Disclaimer: This system is for educational and research purposes only. It is not a substitute for professional medical advice.

---

## Overview

LAMESE AI provides a backend API built with FastAPI that integrates AI to analyze health-related inputs and return intelligent insights. It is designed to be consumed by a frontend dashboard (React + Tailwind).

---

## Core Features

* Symptom-based disease prediction
* Health score (0–100)
* AI-generated explanation
* Actionable recommendations
* REST API for frontend integration

---

## Tech Stack

| Layer    | Technology       |
| -------- | ---------------- |
| Backend  | FastAPI          |
| AI       | OpenAI API       |
| Frontend | React + Tailwind |
| Runtime  | Python 3.10+     |

---

## Project Structure

```
lamese-ai/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── venv/
│
├── frontend/
│
├── .gitignore
└── README.md
```

---

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/lamese-ai.git
cd lamese-ai
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

### 3. Environment Variables

Create a `.env` file inside `/backend`:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

---

### 4. Run Server

```bash
uvicorn main:app --reload
```

Server runs at:

```
http://127.0.0.1:8000
```

API docs:

```
http://127.0.0.1:8000/docs
```

---

## API

### POST `/analyze`

#### Request

```json
{
  "symptoms": "fever, headache, fatigue"
}
```

#### Response

```json
{
  "result": "AI-generated diagnosis, health score, explanation, and recommendations"
}
```

---

## How It Works

```
Client (React)
      ↓
FastAPI Backend
      ↓
OpenAI API
      ↓
Health Insights Response
```

---

## Known Limitations

* Output is unstructured text (can be improved to JSON)
* No user authentication
* No persistent data storage
* Not medically certified

---

## Roadmap

* Structured JSON API responses
* Health dashboard UI
* Voice + image input support
* Authentication system
* Medical history tracking

---

## Author

Ernest Edem Dzisah
GitHub: https://github.com/ernest-edem

---

## License

MIT License
