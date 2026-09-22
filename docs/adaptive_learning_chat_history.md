# Chat History — AI-Based Adaptive Learning Orchestration System

## User request

The user provided a research project document and system information:

- Fedora Linux 44 KDE
- AMD Ryzen 7 7730U, 16 logical processors
- 16 GiB RAM
- Integrated AMD Radeon Graphics
- About 127 GB free disk space
- Python 3.14.7
- Node.js 22.23.1
- npm 10.9.8
- Git 2.55.0

The user requested a detailed implementation plan, assuming Kaggle will be used for heavy CPU/GPU training and free quotas will be used for services.

## Assistant response — implementation plan

### Core architecture

The project is a multi-agent adaptive intervention decision system, not merely a resource recommender.

Interventions:
- LEARN
- PRACTICE
- ASSESS
- REVISE
- REMEDIATE
- CHALLENGE
- ADVANCE
- SWITCH_MODALITY
- PAUSE

Pipeline:

Student interaction
→ Learner-State Engine
→ Specialized Agents
→ Orchestrator
→ Deterministic Decision Validator
→ Approved Intervention
→ Outcome Logging
→ Learner-State Update

Agents:
1. Knowledge
2. Memory
3. Behaviour
4. Goal
5. Pedagogical
6. Orchestrator

Numerical learner-state variables must be produced by measurable statistical/ML methods. LLMs should handle language-heavy tasks, proposal generation, explanations, and structured communication. The validator must operate outside the LLM.

### Local laptop versus Kaggle

Local laptop:
- React/Vite development
- FastAPI development
- Supabase integration
- Schema validation
- Lightweight preprocessing
- Small statistical/scikit-learn experiments
- Learner-state engine
- Model artifact integration

Kaggle:
- Heavy dataset processing
- Neural-network training
- Knowledge-tracing experiments
- Behaviour and retention model training
- Large-scale evaluation
- Baselines and ablations
- Checkpoints and model artifacts

Kaggle should not be the live backend. Train and evaluate models there, export artifacts, and load them in FastAPI.

### Python environment

Use Python 3.12 initially for compatibility. Do not uninstall the system Python.

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

Initial packages:

```bash
pip install fastapi uvicorn[standard] pydantic pydantic-settings polars pandas numpy scikit-learn sqlalchemy psycopg[binary] pytest
```

### Repository

```text
adaptive-learning/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── schemas/
│   └── types/
├── ai/
│   ├── agents/
│   │   ├── knowledge/
│   │   ├── memory/
│   │   ├── behaviour/
│   │   ├── goal/
│   │   ├── pedagogy/
│   │   └── orchestrator/
│   ├── models/
│   ├── retrieval/
│   ├── learner_state/
│   └── evaluation/
├── data/
│   ├── raw/
│   ├── processed/
│   └── pipelines/
├── experiments/
├── mlruns/
├── supabase/
│   ├── migrations/
│   └── seed/
├── docker/
└── docs/
```

Do not commit raw datasets, secrets, or model binaries.

### Implementation order

1. Research specification
2. Repository and environments
3. Dataset pipeline
4. Learner-state engine
5. Baselines
6. Intervention ontology
7. Specialized agents
8. Orchestrator and validator
9. Evaluation and ablations
10. Frontend/backend integration
11. Research reporting

### Dataset strategy

Use one primary dataset first.

The document lists:
- Junyi: prototype and baseline development
- EdNet: behavioural/temporal modelling and main evaluation
- MOOCCubeX: concept graph and resource linkage
- ASSISTments: secondary validation if licensing permits
- OULAD: optional external generalization test

Do not blindly merge datasets. Verify release, license, learner IDs, timestamps, correctness, concept mappings, response times, difficulty information, and dataset size.

Use chronological/temporal splits to prevent future information from entering past learner states.

### Event schema

```python
from datetime import datetime
from pydantic import BaseModel

class InteractionEvent(BaseModel):
    learner_id: str
    concept_id: str
    question_id: str | None = None
    timestamp: datetime
    is_correct: bool
    response_time_seconds: float | None = None
    difficulty: float | None = None
    source_dataset: str
```

Prefer Parquet for processed analytical data.

### Learner-state engine

Implement this before the LLM agents.

State variables:
- Mastery
- Uncertainty
- Retention/forgetting signal
- Recent accuracy
- Response-time statistics
- Repeated-error rate
- Prerequisite readiness
- Goal relevance
- State version

Knowledge Agent:
- Estimate mastery and uncertainty
- Track correctness trends
- Model difficulty effects
- Estimate prerequisite readiness
- Compare simple models before deep models

Memory Agent:
- Time since last successful retrieval
- Successful retrieval count
- Attempt count
- Historical performance
- Time gaps

Behaviour Agent:
- Response time
- Repeated errors
- Skips
- Session duration
- Difficulty tolerance
- Recent error trends

Do not treat slow response time as proof of fatigue.

### Baselines

Implement before the full system:
1. Recommendation-only
2. Knowledge-only
3. Knowledge + Memory
4. Single-agent adaptive baseline
5. Full multi-agent orchestration

### Intervention ontology

Start with four MVP actions:

```python
from enum import Enum

class InterventionType(str, Enum):
    LEARN = "LEARN"
    PRACTICE = "PRACTICE"
    ASSESS = "ASSESS"
    REVISE = "REVISE"
```

Each proposal should contain:
- Agent
- Concept
- Action
- Confidence
- Evidence IDs
- Rationale

Each action needs explicit preconditions, evidence requirements, difficulty constraints, resource linkage, expected outcome, and validation rules.

### Goal Agent

Convert natural-language goals into structured competencies.

Validate output with Pydantic, map competencies to a concept catalog, reject unmapped concepts, and version prompts/models.

Build a deterministic fallback before making an LLM mandatory.

### Pedagogical Agent

Use structured learner state, goals, available interventions, resources, prerequisites, and evidence IDs.

Require schema validation and reject unsupported claims. Log prompt and model versions.

### Orchestrator

Loop:

1. Load evidence
2. Calculate learner state
3. Run agents independently
4. Collect proposals
5. Calculate disagreement
6. Request diagnostic evidence if necessary
7. Select candidate action
8. Run deterministic validator
9. Approve or reject
10. Execute or simulate intervention
11. Record outcome
12. Update state

A basic action-disagreement measure:

```python
from collections import Counter

def calculate_action_disagreement(actions: list[str]) -> float:
    if not actions:
        return 0.0

    counts = Counter(actions)
    max_frequency = max(counts.values())

    return 1.0 - (max_frequency / len(actions))
```

This is only a baseline measure because it ignores confidence and semantic similarity.

### Deterministic validator

Check:
- Valid action
- Evidence sufficiency
- Prerequisite readiness
- Difficulty limits
- Resource-concept linkage
- Confidence thresholds
- Schema validity
- Session constraints
- Progression constraints

The LLM must not bypass validation.

### Supabase and auditability

Suggested tables:
- learner_states
- agent_runs
- orchestration_decisions
- decision_evidence
- intervention_outcomes
- model_versions
- prompt_versions
- resource_metadata

Supabase should store compact operational data, metadata, embeddings, decision traces, and summaries.

Keep raw and large datasets outside Supabase.

### Kaggle workflow

Local development
→ GitHub
→ Kaggle notebook
→ Dataset attachment
→ Training
→ Evaluation
→ Checkpoint/artifact export
→ FastAPI integration

Do not train models inside API request handlers. Load trained artifacts once and use them for inference.

### MLflow

Track:
- Dataset version
- Preprocessing version
- Model type
- Hyperparameters
- Random seed
- Data partitions
- Metrics
- Calibration
- Artifact checksum
- Git commit hash

Use local MLflow with SQLite initially.

### Evaluation

At each frozen evaluation point:
1. Build learner state from history up to time t
2. Freeze evidence
3. Run all baselines and the proposed system
4. Select an intervention
5. Execute or simulate using available held-out interactions
6. Measure immediate and delayed outcomes
7. Repeat across learners/cohorts
8. Run ablations and subgroup analysis

Metrics:
- Learning gain
- Retention
- Time-to-mastery
- Intervention efficiency
- Calibration
- Uncertainty calibration
- Prerequisite violations
- Decision validity
- Secondary recommendation metrics

Offline data does not automatically establish causal learning benefit.

### Disagreement experiment

Compare:

Policy A:
- Select the highest-confidence action immediately.

Policy B:
- Request diagnostic evidence when disagreement is high.

Measure:
- Diagnostic frequency
- Invalid interventions
- Learning gain
- Retention
- Time-to-mastery
- Intervention efficiency
- Calibration
- Computational cost

### Ablations

- Recommendation-only
- Knowledge-only
- Knowledge + Memory
- Single-agent
- Full system
- Full minus Memory
- Full minus Behaviour
- Full minus uncertainty
- Full minus disagreement-triggered diagnostics
- Full minus validator

Keep evaluation data and protocol fixed across comparable experiments.

### Frontend/backend

Suggested frontend routes:
- dashboard
- goal-setup
- diagnostic
- learn
- practice
- assess
- progress
- knowledge-map
- why-this

Suggested API routes:
- /api/v1/health
- /api/v1/goals
- /api/v1/learner-state
- /api/v1/interventions
- /api/v1/decisions
- /api/v1/outcomes
- /api/v1/resources

The backend should be authoritative for learner-state computation and intervention decisions.

### Resource retrieval

Start with deterministic concept and difficulty filtering before adding vector search.

Resource metadata:
- Resource ID
- Concept IDs
- Difficulty
- Modality
- Source

Filtering:
1. Selected concept
2. Concept-linked resources
3. Prerequisite constraints
4. Difficulty
5. Modality
6. Eligible resources

### Main warnings

Avoid:
1. LLM-generated mastery values
2. Building all agents before a baseline
3. Random temporal splitting
4. Causal claims from offline data without causal evidence
5. Blindly merging datasets
6. Storing raw multi-gigabyte datasets in Supabase
7. Using Kaggle as a live backend
8. Depending on continuous free GPU availability
9. Treating LLM confidence as calibrated probability
10. Making the frontend the authoritative decision engine

### Recommended starting point

1. Write the research specification.
2. Freeze the intervention ontology.
3. Choose one primary dataset.
4. Create the repository and environments.
5. Build the normalized event pipeline.
6. Implement the learner-state engine.
7. Establish baselines.
8. Implement multi-agent orchestration only afterward.
