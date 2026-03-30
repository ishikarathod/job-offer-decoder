def generate_negotiation_package(
    company: str,
    title: str,
    offered_salary: float,
    estimated_market_salary: float,
    role_clarity_score: int,
    work_life_balance: str,
) -> dict:
    gap = estimated_market_salary - offered_salary

    recommended_ask_min = int(round(max(offered_salary, offered_salary + gap * 0.45)))
    recommended_ask_max = int(round(max(recommended_ask_min, offered_salary + gap * 0.75)))

    risk_level = "medium"
    if gap <= 5000 and role_clarity_score >= 75:
        risk_level = "low"
    elif gap > 20000 or work_life_balance == "low":
        risk_level = "high"

    balance_note = {
        "high": "The role appears to offer relatively strong flexibility, which supports a confident but collaborative ask.",
        "medium": "The role signals a mixed balance profile, so anchoring to market data is the safest approach.",
        "low": "Since the role may be more demanding, it helps to pair your salary request with questions about support, scope, and expectations.",
    }[work_life_balance]

    message = (
        f"Hi {company} team,\n\n"
        f"Thank you again for the offer for the {title} role. I'm genuinely excited about the opportunity and the impact I could make. "
        f"Based on my review of the market for similar roles, I was hoping we could explore a base salary in the "
        f"${recommended_ask_min:,} to ${recommended_ask_max:,} range.\n\n"
        f"{balance_note} If there is flexibility in the compensation package, I'd love to discuss what might be possible.\n\n"
        "Thank you for considering this, and I'm happy to talk through the details."
    )

    return {
        "recommended_ask_min": recommended_ask_min,
        "recommended_ask_max": recommended_ask_max,
        "risk_level": risk_level,
        "suggested_message": message,
    }

