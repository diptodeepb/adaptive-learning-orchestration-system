from packages.schemas.state import OrchestrationState, InterventionProposal

def knowledge_agent(state: OrchestrationState) -> dict:
    """
    Deterministic agent that estimates mastery and proposes an action purely based on the numerical state.
    """
    ls = state["learner_state"]
    proposals = state.get("proposals", [])
    
    if ls.mastery < 0.4:
        action = "LEARN"
        confidence = 0.8
    elif 0.4 <= ls.mastery < 0.8:
        action = "PRACTICE"
        confidence = 0.7
    else:
        action = "CHALLENGE"
        confidence = 0.9
        
    proposal = InterventionProposal(
        agent="knowledge",
        action=action,
        confidence=confidence,
        reasoning=f"Mastery is {ls.mastery:.2f}"
    )
    return {"proposals": proposals + [proposal]}
