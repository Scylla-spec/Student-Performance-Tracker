from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.database import get_supabase

router = APIRouter()

class ModuleCreate(BaseModel):
    module_code: str
    module_name: str
    credit_hours: int = 3
    semester: int
    phase: int
    academic_year: str
    user_id: str

@router.post("/")
def create_module(data: ModuleCreate):
    supabase = get_supabase()
    try:
        result = supabase.table("modules").insert(data.dict()).execute()
        return {"message": "Module added!", "data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{user_id}")
def get_modules(user_id: str):
    supabase = get_supabase()
    try:
        result = supabase.table("modules").select("*").eq("user_id", user_id).execute()
        return {"data": result.data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))