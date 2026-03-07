from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.database import get_supabase

router = APIRouter()

class MarkCreate(BaseModel):
    module_id: str
    assessment_type: str
    score: float
    max_score: float
    weight: float

@router.post("/")
def add_mark(data: MarkCreate):
    supabase = get_supabase()
    try:
        result = supabase.table("marks").insert(data.dict()).execute()
        return {"message": "Mark added!", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{module_id}")
def get_marks(module_id: str):
    supabase = get_supabase()
    try:
        result = supabase.table("marks").select("*").eq("module_id", module_id).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))