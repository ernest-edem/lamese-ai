from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

app = FastAPI()

# Initialize OpenAI client (uses environment variable)
client = OpenAI()

# Allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model
class Input(BaseModel):
    symptoms: str

# API endpoint
@app.post("/analyze")
def analyze(data: Input):
    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=f"""
            Analyze these symptoms: {data.symptoms}

            Return JSON format:
            {{
              "disease": "...",
              "health_score": "...",
              "explanation": "...",
              "recommendation": "..."
            }}
            """
        )

        result_text = response.output[0].content[0].text

        return {
            "result": result_text
        }

    except Exception as e:
        return {"error": str(e)}