from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
import json
import base64

app = FastAPI()
client = OpenAI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# 🔥 STREAMING ENDPOINT (IMPROVED)
# =========================================================
@app.post("/analyze-stream")
async def analyze_stream(
    age: int = Form(...),
    sex: str = Form(...),
    symptoms: str = Form(...),
):
    def stream():
        prompt = f"""
You are a medical AI assistant.

Patient:
Age: {age}
Sex: {sex}
Symptoms: {symptoms}

Explain your reasoning step-by-step like ChatGPT typing.
"""

        try:
            with client.responses.stream(
                model="gpt-4.1-mini",
                input=prompt,
            ) as response:

                for event in response:
                    if event.type == "response.output_text.delta":
                        yield event.delta

        except Exception as e:
            yield f"\n[ERROR]: {str(e)}"

    return StreamingResponse(stream(), media_type="text/plain")


# =========================================================
# 🧠 FULL AI ANALYSIS (SAFE + ROBUST)
# =========================================================
@app.post("/analyze")
async def analyze(
    age: int = Form(...),
    sex: str = Form(...),
    symptoms: str = Form(...),

    smoking: bool = Form(...),
    alcohol: bool = Form(...),
    exercise: str = Form(...),
    sleep: float = Form(...),
    diet: str = Form(...),

    image: UploadFile = File(None),
    pdf: UploadFile = File(None),
):
    try:
        # =========================
        # 🖼 IMAGE ANALYSIS
        # =========================
        image_analysis = "No image provided"

        if image:
            image_bytes = await image.read()
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

            try:
                vision_response = client.responses.create(
                    model="gpt-4.1-mini",
                    input=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "input_text",
                                    "text": "Analyze this medical image and describe abnormalities."
                                },
                                {
                                    "type": "input_image",
                                    "image_base64": base64_image
                                }
                            ],
                        }
                    ],
                )

                image_analysis = vision_response.output[0].content[0].text

            except Exception as e:
                print("IMAGE ERROR:", e)
                image_analysis = "Image analysis failed"

        # =========================
        # 📄 PDF ANALYSIS
        # =========================
        pdf_summary = "No medical records provided"

        if pdf:
            try:
                pdf_bytes = await pdf.read()
                text_preview = pdf_bytes[:3000].decode("utf-8", errors="ignore")

                pdf_response = client.responses.create(
                    model="gpt-4.1-mini",
                    input=f"Summarize key medical findings:\n{text_preview}"
                )

                pdf_summary = pdf_response.output[0].content[0].text

            except Exception as e:
                print("PDF ERROR:", e)
                pdf_summary = "PDF analysis failed"

        # =========================
        # 🧠 FUSION PROMPT
        # =========================
        prompt = f"""
You are a medical AI assistant.

Analyze ALL inputs:
- Symptoms
- Lifestyle
- Image findings
- Medical records

Patient:
Age: {age}
Sex: {sex}
Symptoms: {symptoms}

Lifestyle:
Smoking: {smoking}
Alcohol: {alcohol}
Exercise: {exercise}
Sleep: {sleep}
Diet: {diet}

Image Findings:
{image_analysis}

Medical Records:
{pdf_summary}

Return STRICT JSON ONLY:

{{
  "disease": "...",
  "health_score": 0,
  "risk_level": "Low | Medium | High",
  "red_flags": ["..."],
  "explanation": "...",
  "recommendation": ["...", "..."]
}}
"""

        # =========================
        # 🤖 AI CALL
        # =========================
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
            text={"format": {"type": "json_object"}}
        )

        raw_text = response.output[0].content[0].text
        print("RAW AI RESPONSE:", raw_text)  # 🔍 DEBUG

        # =========================
        # 🛡 SAFE PARSE
        # =========================
        try:
            result = json.loads(raw_text)
        except Exception as e:
            print("JSON ERROR:", e)

            return {
                "error": "Invalid JSON from AI",
                "raw": raw_text  # 👈 send raw text to frontend
            }

        return result

    except Exception as e:
        print("SERVER ERROR:", e)
        return {"error": str(e)}