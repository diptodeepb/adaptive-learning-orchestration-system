import os
from litellm import completion
from packages.schemas.state import InterventionProposal, LearnerState
import json

# Setup environment variables or fail gracefully if missing
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") # Available for other specific models

def generate_pedagogical_proposal(learner_state: LearnerState, settings: dict = {}) -> InterventionProposal:
    """Uses the configured LLM to generate an initial pedagogical proposal."""
    model_name = settings.get("model", "mistral/open-mistral-nemo")
    
    prompt = f"""
    You are a Pedagogical Agent in an adaptive learning system.
    Based on the learner's state, propose the next best educational intervention.
    
    Learner State: 
    - Mastery: {learner_state.mastery}
    - Uncertainty: {learner_state.uncertainty}
    - Concept ID: {learner_state.concept_id}
    
    Rules:
    - If uncertainty is high (>0.7), suggest ASSESS to gather more data.
    - If mastery is low (<0.4), suggest LEARN or REMEDIATE.
    - If mastery is high (>0.8), suggest ADVANCE or CHALLENGE.
    - Otherwise, suggest PRACTICE or REVISE.
    
    Output exactly in this JSON schema:
    {{
      "agent": "pedagogical",
      "action": "LEARN|PRACTICE|ASSESS|REVISE|REMEDIATE|CHALLENGE|ADVANCE|SWITCH_MODALITY|PAUSE",
      "confidence": 0.0-1.0,
      "reasoning": "brief string"
    }}
    """
    
    try:
        response = completion(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        content = response.choices[0].message.content
        return InterventionProposal.model_validate_json(content)
    except Exception as e:
        print(f"Pedagogical Gateway Error: {e}")
        try:
            print("Attempting fallback with openrouter llama-3.1-8b-instruct:free...")
            response = completion(
                model="openrouter/meta-llama/llama-3.1-8b-instruct:free",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            content = response.choices[0].message.content
            return InterventionProposal.model_validate_json(content)
        except Exception as fallback_e:
            print(f"Fallback Error: {fallback_e}")
            # Final fallback if both fail
            return InterventionProposal(
                agent="pedagogical",
                action="ASSESS" if learner_state.uncertainty > 0.7 else "PRACTICE",
                confidence=0.5,
                reasoning="Fallback due to LLM Gateway error."
            )

def orchestrate_conflict(learner_state: LearnerState, proposals: list[InterventionProposal], settings: dict = {}) -> str:
    """Uses the configured LLM to resolve agent conflicts."""
    model_name = settings.get("model", "mistral/open-mistral-nemo")
    
    proposals_json = [p.model_dump() for p in proposals]
    
    prompt = f"""
    You are the Chief Orchestrator of an adaptive learning system.
    Different specialized agents have proposed conflicting interventions for the learner.
    
    Learner State:
    - Mastery: {learner_state.mastery}
    - Uncertainty: {learner_state.uncertainty}
    
    Agent Proposals:
    {json.dumps(proposals_json, indent=2)}
    
    Your task:
    Select the single best final action from the proposals. 
    If the learner's uncertainty is >0.6 and the proposals fundamentally conflict (e.g. ADVANCE vs REVISE), you MUST choose ASSESS to trigger a diagnostic.
    
    Reply ONLY with the exact string of the chosen action (e.g., ASSESS, PRACTICE, REVISE).
    """
    
    try:
        response = completion(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )
        action = response.choices[0].message.content.strip().upper()
        # Ensure it's a valid action
        valid_actions = ["LEARN", "PRACTICE", "ASSESS", "REVISE", "REMEDIATE", "CHALLENGE", "ADVANCE", "SWITCH_MODALITY", "PAUSE"]
        if action in valid_actions:
            return action
        return "ASSESS"
    except Exception as e:
        print(f"Orchestrator Gateway Error: {e}")
        return "ASSESS" # Safest fallback when in conflict
