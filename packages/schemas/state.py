from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from typing_extensions import TypedDict

class LearnerState(BaseModel):
    mastery: float = Field(default=0.0, description="Estimated mastery [0, 1]")
    uncertainty: float = Field(default=1.0, description="Uncertainty of mastery [0, 1]")
    concept_id: str

class InterventionProposal(BaseModel):
    agent: str = Field(description="Name of the agent making the proposal")
    action: Literal["LEARN", "PRACTICE", "ASSESS", "REVISE", "REMEDIATE", "CHALLENGE", "ADVANCE", "SWITCH_MODALITY", "PAUSE"] = Field(description="The selected intervention action")
    confidence: float = Field(description="Confidence in the proposal [0, 1]")
    reasoning: str = Field(description="Reasoning behind the proposal")

class OrchestrationState(TypedDict):
    learner_state: LearnerState
    proposals: List[InterventionProposal]
    final_action: str
    validation_status: str
    settings: dict
