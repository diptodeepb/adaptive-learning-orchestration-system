from packages.schemas.state import OrchestrationState
from ai.llm_gateway import generate_pedagogical_proposal

def pedagogical_agent(state: OrchestrationState) -> dict:
    """
    LLM-powered agent that proposes an action by reasoning over the learner's state using the Groq LLM Gateway.
    """
    ls = state["learner_state"]
    proposals = state.get("proposals", [])
    
    # Generate proposal via the LLM Gateway
    proposal = generate_pedagogical_proposal(ls, state.get("settings", {}))
    
    return {"proposals": proposals + [proposal]}
