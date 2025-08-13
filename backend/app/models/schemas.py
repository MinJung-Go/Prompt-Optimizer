from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class PromptRequest(BaseModel):
    prompt: str = Field(..., description="The original prompt to optimize")
    model: str = Field(default="gpt-4.1", description="OpenAI model to use")
    context: Optional[str] = Field(None, description="Additional context for optimization")
    optimization_goal: str = Field(default="general", description="Optimization goal: general, clarity, conciseness, creativity, specificity")
    max_tokens: int = Field(default=1000, description="Maximum tokens for the optimized prompt")
    api_key: Optional[str] = Field(None, description="OpenAI API key (optional, overrides env)")
    base_url: Optional[str] = Field(None, description="OpenAI base URL (optional)")

class ConfigRequest(BaseModel):
    api_key: Optional[str] = Field(None, description="OpenAI API key")
    base_url: Optional[str] = Field(None, description="OpenAI base URL")
    model_name: Optional[str] = Field(None, description="OpenAI model name to use")

class PromptResponse(BaseModel):
    original_prompt: str
    optimized_prompt: str
    suggestions: List[str]
    reasoning: str
    model_used: str
    tokens_saved: int = 0
    confidence_score: float = 0.0

class ModelInfo(BaseModel):
    model_name: str
    description: str
    max_tokens: int
    pricing_per_1k_tokens: Dict[str, float]

class OptimizationRequest(BaseModel):
    prompt: str
    target_model: str
    optimization_type: str = Field(default="general", pattern="^(general|clarity|conciseness|creativity|specificity)$")
    context: Optional[str] = None
    examples: Optional[List[str]] = None

class OptimizationResponse(BaseModel):
    success: bool
    optimized_prompt: Optional[str] = None
    suggestions: List[str] = []
    error: Optional[str] = None

class PromptGenerationRequest(BaseModel):
    requirements: str = Field(..., description="User requirements or description of what they need")
    task_type: str = Field(default="general", description="Type of task: general, creative, technical, analytical, educational")
    output_format: str = Field(default="text", description="Desired output format: text, json, list, structured")
    context: Optional[str] = Field(None, description="Additional context or background information")
    constraints: Optional[str] = Field(None, description="Specific constraints or limitations")
    examples: Optional[List[str]] = Field(None, description="Example outputs or similar prompts")
    model: str = Field(default="gpt-4.1", description="OpenAI model to use")
    max_tokens: int = Field(default=1000, description="Maximum tokens for the generated prompt")
    api_key: Optional[str] = Field(None, description="OpenAI API key (optional, overrides env)")
    base_url: Optional[str] = Field(None, description="OpenAI base URL (optional)")

class PromptGenerationResponse(BaseModel):
    generated_prompt: str
    prompt_structure: Dict[str, str] = Field(..., description="Structured breakdown of the prompt components")
    usage_tips: List[str] = Field(..., description="Tips for using the generated prompt effectively")
    alternatives: List[str] = Field(..., description="Alternative prompt variations")
    model_used: str
    confidence_score: float = 0.0