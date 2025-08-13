from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.models.schemas import (
    PromptRequest, PromptResponse, OptimizationRequest, 
    OptimizationResponse, ModelInfo, PromptGenerationRequest, PromptGenerationResponse
)
from app.services.openai_service import OpenAIService

router = APIRouter()
openai_service = OpenAIService()

@router.get("/")
async def root():
    return {"message": "Prompt Optimizer API is running"}

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "prompt-optimizer"}

@router.post("/optimize", response_model=PromptResponse)
async def optimize_prompt(request: PromptRequest):
    """
    Optimize a prompt using AI
    """
    try:
        response = await openai_service.optimize_prompt(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/optimize/advanced", response_model=OptimizationResponse)
async def optimize_prompt_advanced(request: OptimizationRequest):
    """
    Advanced prompt optimization with more options
    """
    try:
        # Convert to PromptRequest format
        prompt_request = PromptRequest(
            prompt=request.prompt,
            model=request.target_model,
            optimization_goal=request.optimization_type,
            context=request.context
        )
        
        response = await openai_service.optimize_prompt(prompt_request)
        
        return OptimizationResponse(
            success=True,
            optimized_prompt=response.optimized_prompt,
            suggestions=response.suggestions,
            error=None
        )
    except Exception as e:
        return OptimizationResponse(
            success=False,
            optimized_prompt=None,
            suggestions=[],
            error=str(e)
        )

@router.get("/models", response_model=List[ModelInfo])
async def get_models():
    """
    Get available OpenAI models
    """
    models = openai_service.get_available_models()
    return [
        ModelInfo(
            model_name=model["name"],
            description=model["description"],
            max_tokens=4096 if "3.5" in model["name"] else 8192,
            pricing_per_1k_tokens={
                "input": 0.0015 if "3.5" in model["name"] else 0.03,
                "output": 0.002 if "3.5" in model["name"] else 0.06
            }
        )
        for model in models
    ]

@router.get("/models/{model_name}")
async def get_model_details(model_name: str):
    """
    Get details for a specific model
    """
    models = await get_models()
    model = next((m for m in models if m.model_name == model_name), None)
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    return model

@router.get("/optimization/types")
async def get_optimization_types():
    """
    Get available optimization types
    """
    return {
        "types": [
            {"type": "general", "description": "General optimization for clarity and effectiveness"},
            {"type": "clarity", "description": "Focus on making the prompt clearer"},
            {"type": "conciseness", "description": "Make the prompt more concise"},
            {"type": "creativity", "description": "Enhance creativity and innovation"},
            {"type": "specificity", "description": "Make the prompt more specific and detailed"}
        ]
    }

@router.post("/validate")
async def validate_prompt(prompt: str):
    """
    Validate if a prompt is well-formed
    """
    issues = []
    
    if len(prompt) < 3:
        issues.append("Prompt is too short")
    
    if len(prompt) > 4000:
        issues.append("Prompt is too long")
    
    if not any(char.isalnum() for char in prompt):
        issues.append("Prompt contains no alphanumeric characters")
    
    return {
        "is_valid": len(issues) == 0,
        "issues": issues,
        "suggestions": [
            "Be specific about what you want",
            "Include relevant context",
            "Use clear and concise language",
            "Specify the desired format of the response"
        ] if issues else []
    }

@router.post("/generate", response_model=PromptGenerationResponse)
async def generate_prompt(request: PromptGenerationRequest):
    """
    Generate a prompt based on user requirements
    """
    try:
        response = await openai_service.generate_prompt_from_requirements(request)
        return PromptGenerationResponse(
            generated_prompt=response["generated_prompt"],
            prompt_structure=response["prompt_structure"],
            usage_tips=response["usage_tips"],
            alternatives=response["alternatives"],
            model_used=response["model_used"],
            confidence_score=response["confidence_score"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/task-types")
async def get_task_types():
    """
    Get available task types for prompt generation
    """
    return {
        "types": [
            {"type": "general", "description": "General-purpose prompts for various tasks"},
            {"type": "creative", "description": "Prompts for creative writing, brainstorming, and innovation"},
            {"type": "technical", "description": "Prompts for technical tasks, coding, and problem-solving"},
            {"type": "analytical", "description": "Prompts for data analysis, research, and critical thinking"},
            {"type": "educational", "description": "Prompts for teaching, learning, and knowledge sharing"}
        ]
    }

@router.get("/output-formats")
async def get_output_formats():
    """
    Get available output formats for prompt generation
    """
    return {
        "formats": [
            {"format": "text", "description": "Free-form text response"},
            {"format": "json", "description": "Structured JSON format"},
            {"format": "list", "description": "Numbered or bulleted list"},
            {"format": "structured", "description": "Specific structured format with sections"}
        ]
    }