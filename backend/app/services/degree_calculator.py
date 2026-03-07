def calculate_weighted_average(marks: list) -> float:
    """Calculate weighted average from a list of marks"""
    if not marks:
        return 0.0
    
    total_weighted = sum(
        (m["score"] / m["max_score"]) * 100 * m["weight"] for m in marks
    )
    total_weight = sum(m["weight"] for m in marks)
    
    if total_weight == 0:
        return 0.0
    
    return round(total_weighted / total_weight, 2)


def get_degree_class(average: float) -> dict:
    """Return degree class based on average mark"""
    if average >= 70:
        return {
            "class": "First Class",
            "range": "70%+",
            "color": "green",
            "message": "Outstanding! Keep this up and you're elite 🏆"
        }
    elif average >= 60:
        return {
            "class": "2:1 Upper Second",
            "range": "60–69%",
            "color": "blue",
            "message": "Strong performance. Push for First Class! 💪"
        }
    elif average >= 50:
        return {
            "class": "2:2 Lower Second",
            "range": "50–59%",
            "color": "orange",
            "message": "⚠️ Warning zone. Employers notice this. Time to grind."
        }
    elif average >= 45:
        return {
            "class": "Third Class",
            "range": "45–49%",
            "color": "red",
            "message": "🚨 Critical. Immediate action needed."
        }
    else:
        return {
            "class": "Fail",
            "range": "Below 45%",
            "color": "red",
            "message": "🚨 At risk of failing. Seek help now."
        }


def what_do_i_need(current_marks: list, target_average: float, remaining_weight: float) -> dict:
    """Calculate minimum score needed in remaining assessments to hit target"""
    if not current_marks:
        return {"needed": target_average, "achievable": True}

    completed_weight = sum(m["weight"] for m in current_marks)
    current_weighted = sum(
        (m["score"] / m["max_score"]) * 100 * m["weight"] for m in current_marks
    )

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