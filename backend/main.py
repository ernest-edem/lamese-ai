from dotenv import load_dotenv

load_dotenv()

from fastapi import (
    FastAPI,
    Form,
    File,
    UploadFile,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from fastapi.responses import (
    StreamingResponse,
    JSONResponse,
)

from fastapi import FastAPI, Form, File, UploadFile

from openai import OpenAI

import json
import base64
import traceback
import io

# =========================================================
# 🚀 APP INIT
# =========================================================
app = FastAPI()

client = OpenAI()

# =========================================================
# 🌍 CORS
# =========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# ❤️ ROOT ROUTE
# =========================================================
@app.get("/")
async def root():
    return {
        "message": "LAMESE AI Backend Running"
    }

# =========================================================
# 🎤 WHISPER TRANSCRIPTION
# =========================================================
@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...)
):
    try:

        audio_bytes = await audio.read()

        if not audio_bytes:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Empty audio file"
                }
            )

        audio_file = io.BytesIO(audio_bytes)

        audio_file.name = (
            audio.filename
            or "voice.webm"
        )

        transcript = (
            client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=audio_file,
            )
        )

        return {
            "text": transcript.text
        }

    except Exception as e:

        traceback.print_exc()

        return JSONResponse(
            status_code=500,
            content={
                "error": str(e)
            },
        )

# =========================================================
# 🎤 WHISPER TRANSCRIPTION
# =========================================================
@app.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...)
):
    try:

        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=(
                audio.filename,
                await audio.read(),
                audio.content_type,
            ),
        )

        return {
            "text": transcript.text
        }

    except Exception as e:

        traceback.print_exc()

        return {
            "error": str(e)
        }
    
# =========================================================
# 🔥 STREAMING AI ENDPOINT
# =========================================================
@app.post("/analyze-stream")
async def analyze_stream(

    # basic
    age: int = Form(...),
    sex: str = Form(...),
    symptoms: str = Form(...),

    # lifestyle
    smoking: bool = Form(False),
    alcohol: bool = Form(False),
    exercise: str = Form("moderate"),
    sleep: float = Form(6),
    diet: str = Form("average"),

    # uploads
    image: UploadFile = File(None),
    pdf: UploadFile = File(None),
):

    def stream():

        prompt = f"""
You are an advanced AI medical assistant.

Analyze the patient progressively.

====================================
PATIENT INFORMATION
====================================

Age: {age}
Sex: {sex}

Symptoms:
{symptoms}

====================================
LIFESTYLE
====================================

Smoking: {smoking}
Alcohol: {alcohol}
Exercise: {exercise}
Sleep: {sleep}
Diet: {diet}

====================================
TASK
====================================

Provide:
- live reasoning
- possible conditions
- health concerns
- observations
- risk discussion

IMPORTANT:
- stream naturally
- conversational tone
- sound like ChatGPT typing
"""

        try:

            with client.responses.stream(
                model="gpt-4.1-mini",
                input=prompt,
            ) as response:

                for event in response:

                    if (
                        event.type
                        == "response.output_text.delta"
                    ):
                        yield event.delta

        except Exception as e:

            traceback.print_exc()

            yield (
                f"\n[STREAM ERROR]: "
                f"{str(e)}"
            )

    return StreamingResponse(
        stream(),
        media_type="text/plain",
    )

# =========================================================
# 🧠 FULL AI ANALYSIS
# =========================================================
@app.post("/analyze")
async def analyze(

    # basic
    age: int = Form(...),
    sex: str = Form(...),
    symptoms: str = Form(...),

    # lifestyle
    smoking: bool = Form(...),
    alcohol: bool = Form(...),
    exercise: str = Form(...),
    sleep: float = Form(...),
    diet: str = Form(...),

    # uploads
    image: UploadFile = File(None),
    pdf: UploadFile = File(None),
):
    try:

        # =================================================
        # 🖼 IMAGE ANALYSIS
        # =================================================
        image_analysis = (
            "No image provided"
        )

        if image:

            try:

                image_bytes = (
                    await image.read()
                )

                if image_bytes:

                    base64_image = (
                        base64.b64encode(
                            image_bytes
                        ).decode("utf-8")
                    )

                    mime_type = (
                        image.content_type
                        or "image/jpeg"
                    )

                    vision_response = (
                        client.responses.create(
                            model="gpt-4.1-mini",
                            input=[
                                {
                                    "role": "user",
                                    "content": [

                                        {
                                            "type":
                                            "input_text",

                                            "text":
                                            """
Analyze this medical image carefully.

Identify:
- abnormalities
- inflammation
- infections
- visible symptoms
- possible medical concerns
"""
                                        },

                                        {
                                            "type":
                                            "input_image",

                                            "image_url":
                                            f"data:{mime_type};base64,{base64_image}"
                                        }
                                    ],
                                }
                            ],
                        )
                    )

                    image_analysis = (
                        vision_response.output_text
                    )

            except Exception as e:

                traceback.print_exc()

                image_analysis = (
                    f"Image analysis failed: {str(e)}"
                )

        # =================================================
        # 📄 PDF ANALYSIS
        # =================================================
        pdf_summary = (
            "No medical records provided"
        )

        if pdf:

            try:

                pdf_bytes = (
                    await pdf.read()
                )

                if pdf_bytes:

                    text_preview = (
                        pdf_bytes[:5000]
                        .decode(
                            "utf-8",
                            errors="ignore"
                        )
                    )

                    pdf_response = (
                        client.responses.create(
                            model="gpt-4.1-mini",
                            input=f"""
Summarize these medical records.

Focus on:
- diagnoses
- medications
- abnormalities
- lab findings
- risk indicators

Records:
{text_preview}
"""
                        )
                    )

                    pdf_summary = (
                        pdf_response.output_text
                    )

            except Exception as e:

                traceback.print_exc()

                pdf_summary = (
                    f"PDF analysis failed: {str(e)}"
                )

        # =================================================
        # 🧠 MASTER PROMPT
        # =================================================
        prompt = f"""
You are an advanced medical AI system.

Analyze ALL patient data together.

====================================
PATIENT DATA
====================================

Age: {age}
Sex: {sex}

Symptoms:
{symptoms}

====================================
LIFESTYLE
====================================

Smoking: {smoking}
Alcohol: {alcohol}
Exercise: {exercise}
Sleep: {sleep}
Diet: {diet}

====================================
IMAGE FINDINGS
====================================

{image_analysis}

====================================
MEDICAL RECORDS
====================================

{pdf_summary}

====================================
TASK
====================================

Generate STRICT VALID JSON ONLY.

Required:
1. disease
2. health_score
3. risk_level
4. red_flags
5. explanation
6. recommendation

Rules:
- NO markdown
- NO triple backticks
- NO explanation outside JSON
- health_score must be integer
- red_flags must be array
- recommendation must be array

JSON FORMAT:

{{
  "disease": "condition",
  "health_score": 75,
  "risk_level": "Low",
  "red_flags": [
    "flag 1"
  ],
  "explanation": "Detailed explanation",
  "recommendation": [
    "recommendation 1",
    "recommendation 2"
  ]
}}
"""

        # =================================================
        # 🤖 AI REQUEST
        # =================================================
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
            text={
                "format": {
                    "type": "json_object"
                }
            }
        )

        # =================================================
        # 🔍 RAW OUTPUT
        # =================================================
        raw_text = response.output_text

        print("\n========================")
        print("RAW AI RESPONSE:")
        print(raw_text)
        print("========================\n")

        # =================================================
        # 🛡 CLEAN RESPONSE
        # =================================================
        raw_text = (
            raw_text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        # =================================================
        # 🛡 SAFE JSON PARSE
        # =================================================
        try:

            result = json.loads(
                raw_text
            )

        except Exception:

            traceback.print_exc()

            # =============================================
            # FALLBACK RESPONSE
            # =============================================
            result = {
                "disease":
                "Unable to determine condition",

                "health_score":
                50,

                "risk_level":
                "Moderate",

                "red_flags": [
                    "AI response formatting issue"
                ],

                "explanation":
                raw_text,

                "recommendation": [
                    "Consult a healthcare professional",
                    "Retry the analysis",
                ],
            }

        # =================================================
        # 🛡 FALLBACKS
        # =================================================
        result.setdefault(
            "disease",
            "Unknown Condition"
        )

        result.setdefault(
            "health_score",
            0
        )

        result.setdefault(
            "risk_level",
            "Unknown"
        )

        result.setdefault(
            "red_flags",
            []
        )

        result.setdefault(
            "explanation",
            "No explanation available"
        )

        result.setdefault(
            "recommendation",
            []
        )

        # =================================================
        # 🛡 TYPE SAFETY
        # =================================================
        try:

            result["health_score"] = int(
                result.get(
                    "health_score",
                    0
                )
            )

        except:

            result["health_score"] = 0

        if not isinstance(
            result["red_flags"],
            list
        ):
            result["red_flags"] = []

        if not isinstance(
            result["recommendation"],
            list
        ):
            result["recommendation"] = []

        # =================================================
        # ✅ FINAL RESPONSE
        # =================================================
        return result

    except Exception as e:

        traceback.print_exc()

        return {
            "error": str(e)
        }