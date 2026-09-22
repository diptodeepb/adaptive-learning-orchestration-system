from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import uvicorn
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict
from langchain_ollama import ChatOllama
import operator

app = FastAPI(title="Adaptive Learning Orchestration API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return RedirectResponse(url="/docs")

# --- Schemas ---
class LearnerState(BaseModel):
    mastery: float = Field(default=0.0, description="Estimated mastery [0, 1]")
    uncertainty: float = Field(default=1.0, description="Uncertainty of mastery [0, 1]")
    concept_id: str

class InterventionProposal(BaseModel):
    agent: str = Field(description="Name of the agent making the proposal")
    action: Literal["LEARN", "PRACTICE", "ASSESS", "REVISE", "REMEDIATE", "CHALLENGE", "ADVANCE", "SWITCH_MODALITY", "PAUSE"] = Field(description="The selected intervention action")
    confidence: float = Field(description="Confidence in the proposal [0, 1]")
    reasoning: str = Field(description="Reasoning behind the proposal")

# --- Graph State ---
class OrchestrationState(TypedDict):
    learner_state: LearnerState
    proposals: List[InterventionProposal]
    final_action: str
    validation_status: str

# --- Agents ---
def knowledge_agent(state: OrchestrationState) -> dict:
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
        reasoning=f"Mastery is {ls.mastery}"
    )
    return {"proposals": proposals + [proposal]}

def pedagogical_agent(state: OrchestrationState) -> dict:
    ls = state["learner_state"]
    proposals = state.get("proposals", [])
    
    # Initialize the LLM
    try:
        llm = ChatOllama(model="qwen3:4b", temperature=0.1)
        structured_llm = llm.with_structured_output(InterventionProposal)
        
        prompt = f"""
        You are a Pedagogical Agent. Based on the learner's state, propose an intervention.
        Learner State: Mastery={ls.mastery}, Uncertainty={ls.uncertainty}, Concept={ls.concept_id}.
        
        If uncertainty is high (>0.7), you should usually suggest ASSESS to gather more data.
        If mastery is low (<0.4), suggest LEARN or REMEDIATE.
        If mastery is high (>0.8), suggest ADVANCE or CHALLENGE.
        Otherwise, suggest PRACTICE or REVISE.
        
        Always provide a confidence score between 0.0 and 1.0, and write a brief reasoning.
        """
        
        proposal = structured_llm.invoke(prompt)
        # Ensure the agent name is set correctly
        proposal.agent = "pedagogical"
        
    except Exception as e:
        # Fallback if LLM fails
        print(f"Pedagogical LLM failed: {e}")
        proposal = InterventionProposal(
            agent="pedagogical",
            action="ASSESS" if ls.uncertainty > 0.7 else "PRACTICE",
            confidence=0.5,
            reasoning=f"Fallback due to LLM error. Uncertainty is {ls.uncertainty}."
        )

    return {"proposals": proposals + [proposal]}

# --- Validator ---
def deterministic_validator(state: OrchestrationState) -> dict:
    proposals = state.get("proposals", [])
    ls = state["learner_state"]
    
    if not proposals:
        return {"final_action": "NONE", "validation_status": "FAILED_NO_PROPOSALS"}
    
    # Simple disagreement logic: if high uncertainty and agents disagree, force ASSESS
    actions = [p.action for p in proposals]
    has_disagreement = len(set(actions)) > 1
    
    if has_disagreement and ls.uncertainty > 0.6:
        return {"final_action": "ASSESS", "validation_status": "DISAGREEMENT_TRIGGERED_DIAGNOSTIC"}
    
    # Otherwise, pick highest confidence proposal
    best_proposal = max(proposals, key=lambda p: p.confidence)
    
    return {"final_action": best_proposal.action, "validation_status": "PASSED"}

# --- LangGraph Setup ---
workflow = StateGraph(OrchestrationState)
workflow.add_node("knowledge_agent", knowledge_agent)
workflow.add_node("pedagogical_agent", pedagogical_agent)
workflow.add_node("validator", deterministic_validator)

workflow.add_edge(START, "knowledge_agent")
workflow.add_edge("knowledge_agent", "pedagogical_agent")
workflow.add_edge("pedagogical_agent", "validator")
workflow.add_edge("validator", END)

orchestrator_app = workflow.compile()

# --- API Endpoints ---
@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/decisions")
def orchestrate_decision(learner_state: LearnerState):
    initial_state = {
        "learner_state": learner_state,
        "proposals": [],
        "final_action": "",
        "validation_status": ""
    }
    
    try:
        result = orchestrator_app.invoke(initial_state)
        return {
            "learner_state": learner_state.model_dump(),
            "proposals": [p.model_dump() for p in result["proposals"]],
            "decision": result["final_action"],
            "validation_status": result["validation_status"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
