def calculate_weighted_average(marks: list) -> float:
    """Calculate weighted average from a list of marks for a single module"""
    if not marks:
        return 0.0

    total_weighted = sum(
        (m["score"] / m["max_score"]) * 100 * m["weight"] for m in marks
    )
    total_weight = sum(m["weight"] for m in marks)

    if total_weight == 0:
        return 0.0

    return round(total_weighted / total_weight, 2)


def calculate_credit_weighted_average(module_averages: list) -> float:
    """
    Calculate overall average weighted by credit hours.
    module_averages = [{"average": 65.0, "credit_hours": 3}, ...]
    """
    if not module_averages:
        return 0.0

    total_weighted = sum(m["average"] * m["credit_hours"] for m in module_averages)
    total_credits = sum(m["credit_hours"] for m in module_averages)

    if total_credits == 0:
        return 0.0

    return round(total_weighted / total_credits, 2)


def get_degree_class(average: float) -> dict:
    if average >= 75:
        return {
            "class": "Distinction",
            "range": "75–100%",
            "color": "green",
            "message": "Outstanding! You're at the top 🏆"
        }
    elif average >= 65:
        return {
            "class": "2:1 Upper Second",
            "range": "65–74%",
            "color": "blue",
            "message": "Strong performance. Push for Distinction! 💪"
        }
    elif average >= 60:
        return {
            "class": "2:2 Lower Second",
            "range": "60–64%",
            "color": "blue",
            "message": "You're passing but 2:1 is within reach. Push harder!"
        }
    elif average >= 50:
        return {
            "class": "Pass",
            "range": "50–59%",
            "color": "orange",
            "message": "⚠️ You're passing but employers notice this. Time to grind."
        }
    else:
        return {
            "class": "Fail",
            "range": "0–49%",
            "color": "red",
            "message": "🚨 At risk of failing. Seek help now."
        }


def what_do_i_need(current_marks: list, target_average: float, remaining_weight: float) -> dict:
    """Calculate minimum score needed in remaining assessments to hit target"""
    if not current_marks:
        return {"needed": target_average, "achievable": True, "message": f"You need {target_average}% overall."}

    completed_weight = sum(m["weight"] for m in current_marks)
    current_weighted = sum(
        (m["score"] / m["max_score"]) * 100 * m["weight"] for m in current_marks
    )

    if remaining_weight <= 0:
        return {"needed": 0, "achievable": False, "message": "No remaining assessments entered."}

    needed = (target_average * (completed_weight + remaining_weight) - current_weighted) / remaining_weight

    return {
        "needed": round(needed, 2),
        "achievable": needed <= 100,
        "message": (
            f"You need {round(needed, 2)}% in remaining assessments to hit {target_average}%"
            if needed <= 100
            else f"Hitting {target_average}% is no longer mathematically possible. Aim for next best class."
        )
    }