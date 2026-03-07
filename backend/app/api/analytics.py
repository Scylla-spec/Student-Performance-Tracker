from fastapi import APIRouter, HTTPException
from app.core.database import get_supabase
from app.services.degree_calculator import calculate_weighted_average, get_degree_class, what_do_i_need

router = APIRouter()

@router.get("/projection/{user_id}")
def get_degree_projection(user_id: str):
    supabase = get_supabase()
    try:
        # Get all modules for this student
        modules = supabase.table("modules").select("*").eq("user_id", user_id).execute()
        
        if not modules.data:
            return {"message": "No modules found", "projection": None}
        
        all_marks = []
        module_summaries = []

        for module in modules.data:
            marks = supabase.table("marks").select("*").eq("module_id", module["id"]).execute()
            avg = calculate_weighted_average(marks.data)
            all_marks.extend(marks.data)
            module_summaries.append({
                "module_code": module["module_code"],
                "module_name": module["module_name"],
                "phase": module["phase"],
                "average": avg,
                "degree_class": get_degree_class(avg)
            })

        overall_avg = calculate_weighted_average(all_marks)
        projection = get_degree_class(overall_avg)

        return {
            "overall_average": overall_avg,
            "projection": projection,
            "modules": module_summaries
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/whatdoineed/{user_id}")
def get_what_do_i_need(user_id: str, target: float = 60.0, remaining_weight: float = 40.0):
    supabase = get_supabase()
    try:
        modules = supabase.table("modules").select("*").eq("user_id", user_id).execute()
        all_marks = []

        for module in modules.data:
            marks = supabase.table("marks").select("*").eq("module_id", module["id"]).execute()
            all_marks.extend(marks.data)

        result = what_do_i_need(all_marks, target, remaining_weight)
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))