from fastapi import APIRouter, HTTPException
from app.core.database import get_supabase
from app.services.degree_calculator import (
    calculate_weighted_average,
    calculate_credit_weighted_average,
    get_degree_class,
    what_do_i_need
)

router = APIRouter()

@router.get("/projection/{user_id}")
def get_degree_projection(user_id: str):
    supabase = get_supabase()
    try:
        modules = supabase.table("modules").select("*").eq("user_id", user_id).execute()

        if not modules.data:
            return {"message": "No modules found", "projection": None}

        # Get program semester weights if available
        program = supabase.table("programs").select("*").eq("user_id", user_id).execute()
        semester_weights = {}
        if program.data:
            program_id = program.data[0]["id"]
            weights = supabase.table("semester_weights").select("*").eq("program_id", program_id).execute()
            for w in weights.data:
                semester_weights[w["semester_number"]] = w["weight"]

        module_summaries = []
        # Group modules by semester
        semester_data = {}

        for module in modules.data:
            marks = supabase.table("marks").select("*").eq("module_id", module["id"]).execute()
            avg = calculate_weighted_average(marks.data)

            module_summaries.append({
                "module_code": module["module_code"],
                "module_name": module["module_name"],
                "phase": module["phase"],
                "semester": module["semester"],
                "credit_hours": module["credit_hours"],
                "average": avg,
                "degree_class": get_degree_class(avg)
            })

            if marks.data:
                sem = module["semester"]
                if sem not in semester_data:
                    semester_data[sem] = []
                semester_data[sem].append({
                    "average": avg,
                    "credit_hours": module["credit_hours"]
                })

        # Calculate per-semester averages
        semester_averages = {}
        for sem, mods in semester_data.items():
            semester_averages[sem] = calculate_credit_weighted_average(mods)

        # Apply semester weights to get overall average
        if semester_weights and semester_averages:
            total_weight_used = sum(
                semester_weights.get(sem, 0) for sem in semester_averages
            )
            if total_weight_used > 0:
                overall_avg = sum(
                    semester_averages[sem] * semester_weights.get(sem, 0)
                    for sem in semester_averages
                ) / total_weight_used
                overall_avg = round(overall_avg, 2)
            else:
                overall_avg = calculate_credit_weighted_average([
                    {"average": avg, "credit_hours": 1}
                    for avg in semester_averages.values()
                ])
        else:
            # Fallback: simple credit-weighted average across all modules
            all_module_avgs = [
                {"average": m["average"], "credit_hours": m["credit_hours"]}
                for m in module_summaries if m["average"] > 0
            ]
            overall_avg = calculate_credit_weighted_average(all_module_avgs)

        projection = get_degree_class(overall_avg)

        return {
            "overall_average": overall_avg,
            "projection": projection,
            "modules": module_summaries,
            "semester_averages": semester_averages,
            "using_program_weights": bool(semester_weights)
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