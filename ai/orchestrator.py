from langgraph.graph import StateGraph, START, END
from packages.schemas.state import OrchestrationState
from ai.agents.knowledge import knowledge_agent
from ai.agents.pedagogical import pedagogical_agent
from ai.llm_gateway import orchestrate_conflict

def deterministic_validator(state: OrchestrationState) -> dict:
    """
    Validates proposals and uses Mistral Large via the Gateway if there's a conflict.
    """
    proposals = state.get("proposals", [])
    ls = state["learner_state"]
    
    if not proposals:
        return {"final_action": "NONE", "validation_status": "FAILED_NO_PROPOSALS"}
    
    actions = [p.action for p in proposals]
    has_disagreement = len(set(actions)) > 1
    
    # If there is a disagreement, invoke the heavy-weight orchestrator
    if has_disagreement:
        final_action = orchestrate_conflict(ls, proposals, state.get("settings", {}))
        status = "RESOLVED_BY_ORCHESTRATOR"
    else:
        # Otherwise, pick highest confidence proposal
        best_proposal = max(proposals, key=lambda p: p.confidence)
        final_action = best_proposal.action
        status = "PASSED"
        
    return {"final_action": final_action, "validation_status": status}

# --- LangGraph Setup ---
workflow = StateGraph(OrchestrationState)

# Add agents
workflow.add_node("knowledge_agent", knowledge_agent)
workflow.add_node("pedagogical_agent", pedagogical_agent)
workflow.add_node("validator", deterministic_validator)

# Simple linear execution for now
workflow.add_edge(START, "knowledge_agent")
workflow.add_edge("knowledge_agent", "pedagogical_agent")
workflow.add_edge("pedagogical_agent", "validator")
workflow.add_edge("validator", END)

orchestrator_app = workflow.compile()
