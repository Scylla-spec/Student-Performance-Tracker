from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.database import get_supabase

router = APIRouter()

class SemesterWeight(BaseModel):
    semester_number: int
    weight: float
    label: str = ""

class ProgramCreate(BaseModel):
    user_id: str
    program_name: str
    total_semesters: int
    semester_weights: list[SemesterWeight]

@router.post("/")
def create_program(data: ProgramCreate):
    supabase = get_supabase()
    try:
        # Check if user already has a program
        existing = supabase.table("programs").select("*").eq("user_id", data.user_id).execute()
        if existing.data:
            # Delete old semester weights and program
            old_program_id = existing.data[0]["id"]
            supabase.table("semester_weights").delete().eq("program_id", old_program_id).execute()
            supabase.table("programs").delete().eq("id", old_program_id).execute()

        # Create new program
        program = supabase.table("programs").insert({
            "user_id": data.user_id,
            "program_name": data.program_name,
            "total_semesters": data.total_semesters
        }).execute()

        program_id = program.data[0]["id"]

        # Insert semester weights
        weights = [
            {
                "program_id": program_id,
                "semester_number": sw.semester_number,
                "weight": sw.weight,
                "label": sw.label
            }
            for sw in data.semester_weights
        ]
        supabase.table("semester_weights").insert(weights).execute()

        return {"message": "Program setup saved!", "program_id": program_id}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{user_id}")
def get_program(user_id: str):
    supabase = get_supabase()
    try:
        program = supabase.table("programs").select("*").eq("user_id", user_id).execute()

        if not program.data:
            return {"program": None}

        program_id = program.data[0]["id"]
        weights = supabase.table("semester_weights").select("*").eq("program_id", program_id).order("semester_number").execute()

        return {
            "program": program.data[0],
            "semester_weights": weights.data
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))