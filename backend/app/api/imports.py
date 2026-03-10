from fastapi import APIRouter, UploadFile, File, HTTPException
from openai import OpenAI
import base64
import json
from app.core.config import settings

router = APIRouter()

@router.post("/extract/{user_id}")
async def extract_results(user_id: str, file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        media_type = file.content_type

        if media_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise HTTPException(status_code=400, detail="Only images (JPG, PNG, WEBP) are supported.")

        encoded = base64.standard_b64encode(file_bytes).decode("utf-8")

        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.OPENROUTER_API_KEY
        )

        response = client.chat.completions.create(
            model="nvidia/nemotron-nano-12b-v2-vl:free",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{encoded}"
                            }
                        },
                        {
                            "type": "text",
                            "text": """Extract all academic results from this image.
Return ONLY a JSON array with no extra text, no markdown, no explanation.
Each object must have these exact keys:
- module_code (string)
- module_name (string)
- mark (number)
- semester (number, use 1 if unknown)
- academic_year (string, e.g. "2025")
- credit_hours (number, use 3 if unknown)
- phase (number, use 1 if unknown)

Skip any rows that say PART ASSESSMENT or are not actual courses.

Example:
[{"module_code":"SCS2211","module_name":"Software Project Management","mark":65,"semester":1,"academic_year":"2025","credit_hours":3,"phase":1}]"""
                        }
                    ]
                }
            ]
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        extracted = json.loads(raw)

        return {"extracted": extracted, "count": len(extracted)}

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parse error: {str(e)} | Raw response: {raw}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/confirm/{user_id}")
async def confirm_import(user_id: str, modules: list[dict]):
    from app.core.database import get_supabase
    supabase = get_supabase()
    try:
        saved = []
        for mod in modules:
            module_res = supabase.table("modules").insert({
                "user_id": user_id,
                "module_code": mod["module_code"],
                "module_name": mod["module_name"],
                "credit_hours": mod.get("credit_hours", 3),
                "semester": mod.get("semester", 1),
                "phase": mod.get("phase", 1),
                "academic_year": str(mod.get("academic_year", "2025"))
            }).execute()

            module_id = module_res.data[0]["id"]

            supabase.table("marks").insert({
                "module_id": module_id,
                "assessment_type": "Final Result",
                "score": float(mod["mark"]),
                "max_score": 100.0,
                "weight": 100.0
            }).execute()

            saved.append(mod["module_code"])

        return {"message": f"Successfully imported {len(saved)} modules!", "modules": saved}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))