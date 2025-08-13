import os
import httpx
import openai
from pydantic import BaseModel
from typing import List, Dict, Optional
from dotenv import load_dotenv
from app.models.schemas import PromptResponse, PromptRequest

load_dotenv()

class OpenAIService:
    def __init__(self):
        self.default_api_key = os.getenv("OPENAI_API_KEY")
        self.default_base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    
    def get_client(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """Get OpenAI client with optional custom API key and base URL"""
        return openai.OpenAI(
                api_key=api_key or self.default_api_key,
                base_url=base_url or self.default_base_url
            )
        
    async def optimize_prompt(self, request: PromptRequest) -> PromptResponse:
        """
        Optimize a prompt using OpenAI's API
        """
        optimization_prompts = {
            "general": """Optimize this prompt for better clarity, effectiveness, and results. 
                        Provide the optimized prompt along with specific suggestions for improvement.
                        Original prompt: {prompt}""",
            
            "clarity": """Rewrite this prompt to be exceptionally clear and unambiguous. 
                         Focus on precise language, clear instructions, and logical structure.
                         Original prompt: {prompt}""",
            
            "conciseness": """Optimize this prompt to be more concise while maintaining its effectiveness.
                             Remove redundancy and unnecessary words without losing important details.
                             Original prompt: {prompt}""",
            
            "creativity": """Enhance this prompt to encourage more creative and innovative responses.
                           Add elements that stimulate creative thinking and unique perspectives.
                           Original prompt: {prompt}""",
            
            "specificity": """Make this prompt more specific and detailed to get more targeted and accurate responses.
                             Add specific constraints, examples, or requirements where appropriate.
                             Original prompt: {prompt}"""
        }
        
        system_prompt = """You are a prompt optimization expert. Your task is to rewrite and enhance user-provided prompts to achieve clearer, more effective, and higher-quality outputs.

# **Rules:**
Follow the COAST framework and format when optimizing prompts:

## Context (背景)
- Understand the purpose, target audience, domain, and constraints of the original prompt.
- Extract and incorporate relevant details from any supplementary text or user-provided background.

## Objectives (目标)
1. Ensure the optimized prompt is clear, specific, and unambiguous.
2. Improve contextual richness for better model understanding.
3. Break down complex tasks into manageable steps.
4. Include examples, constraints, or formatting instructions when beneficial.
5. If the original prompt is empty, generate a suitable prompt based on the supplementary text and user needs.

## Action (行动)
- Rewrite the prompt to maximize clarity, relevance, and usability.
- Structure the prompt logically, following COAST principles.
- Integrate relevant examples or reference points when needed.
- Maintain alignment with user intent.

## Support (支持)
- Suggest additional information that could improve the prompt.
- Provide recommendations for constraints, formats, or tone adjustments.
- Highlight missing details that may hinder optimal results.

## Technology (技术)
- Leverage prompt-engineering best practices.
- Apply domain-specific terminology when relevant.
- Use structured response formatting to ensure consistency.

# **Output format:**
Return your results in the following JSON format:
{
    "optimized_prompt": "your optimized prompt here, output format: ## Context: ## Objectives: ## Action: ## Support: ## Technology:",
    "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
    "reasoning": "explanation of why these changes improve the prompt",
    "confidence_score": 0.0-1.0
}
"""

        user_prompt = optimization_prompts.get(request.optimization_goal, optimization_prompts["general"])
        formatted_prompt = user_prompt.format(prompt=request.prompt)
        
        if request.context:
            formatted_prompt += f"\n\nAdditional context / User demand: {request.context}"
        
        try:
            class PolishSchems(BaseModel):
                optimized_prompt: str
                suggestions: List[str]
                reasoning: str
                confidence_score: str
            client = self.get_client(request.api_key, request.base_url)
            print("Sending request to OpenAI...")
            print(f"Base URL: {request.base_url}")
            response = client.chat.completions.create(
                model=request.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": formatted_prompt}
                ],
                max_tokens=request.max_tokens,
                temperature=0.7,
                response_format={
                                "type": "json_schema",
                                "json_schema": {
                                    "name": "PolishSchems",
                                    "schema": PolishSchems.model_json_schema()
                                }
                            },
            )
            
            content = response.choices[0].message.content
            import json
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                result = {
                    "optimized_prompt": content,
                    "suggestions": ["Review the optimized prompt for clarity"],
                    "reasoning": "AI-generated optimization",
                    "confidence_score": 0.8
                }
            
            original_length = len(request.prompt.split())
            optimized_length = len(result["optimized_prompt"].split())
            tokens_saved = max(0, original_length - optimized_length)
            
            return PromptResponse(
                original_prompt=request.prompt,
                optimized_prompt=result["optimized_prompt"],
                suggestions=result["suggestions"],
                reasoning=result["reasoning"],
                model_used=request.model,
                tokens_saved=tokens_saved,
                confidence_score=result.get("confidence_score", 0.8)
            )
            
        except Exception as e:
            raise Exception(f"Error optimizing prompt: {str(e)}")
    
    def get_available_models(self) -> List[Dict[str, str]]:
        """
        Get list of available OpenAI models
        """
        return [
            {"name": "gpt-4.1", "description": "Latest GPT-4.1 model with enhanced capabilities"},
            {"name": "gpt-4o", "description": "GPT-4 Omni - multimodal capabilities"},
            {"name": "gpt-4.1-mini", "description": "GPT-4.1 Mini - cost-effective GPT-4.1 variant"},
            {"name": "gpt-4o-mini", "description": "GPT-4 Omni Mini - fast and cost-effective"},
        ]
    
    async def generate_prompt_from_requirements(self, request) -> dict:
        """
        Generate a prompt based on user requirements using the COAST framework structure
        """
        task_type_prompts = {
            "general": "Create a general-purpose prompt that clearly communicates the user's needs.",
            "creative": "Design a prompt that encourages creative, innovative, and imaginative responses.",
            "technical": "Develop a precise technical prompt suitable for technical analysis or problem-solving.",
            "analytical": "Create a structured prompt for analytical thinking and data-driven responses.",
            "educational": "Design an educational prompt that facilitates learning and knowledge transfer."
        }

        system_prompt = """You are an expert prompt engineer. Your task is to create high-quality prompts based on user requirements using the COAST framework. 

# **Rules:**
Follow the COAST framework and format when generating prompts:

## Context (背景)
- Establish the background, purpose, and relevant domain knowledge
- Define the target audience and their expertise level
- Include any necessary environmental or situational context

## Objectives (目标)
- Clearly state what the AI should accomplish
- Define specific, measurable outcomes
- Break complex tasks into clear, sequential steps when needed

## Action (行动)
- Provide clear, actionable instructions
- Specify the format and structure of the response
- Include examples or templates when helpful
- Define any constraints or limitations

## Support (支持)
- Offer guidance on how to approach the task
- Provide relevant resources or references
- Include troubleshooting tips or common pitfalls to avoid

## Technology (技术)
- Use appropriate technical terminology for the domain
- Leverage prompt engineering best practices
- Structure the prompt for optimal AI understanding

Generate a comprehensive prompt that incorporates all these elements based on the user's requirements."""

        user_prompt = f"""
Based on the following requirements, generate a high-quality prompt:

# **Requirements**: {request.requirements}

# **Task Type**: {task_type_prompts[request.task_type]}
# **Output Format**: {request.output_format}

"""

        if request.context:
            user_prompt += f"# **Additional Context**: {request.context}\n\n"
            
        if request.constraints:
            user_prompt += f"# **Constraints**: {request.constraints}\n\n"
            
        if request.examples and len(request.examples) > 0:
            user_prompt += f"# **Examples**: {', '.join(request.examples)}\n\n"

        user_prompt += """
Generate a prompt that follows the COAST framework and is ready to use. Provide:
1. The complete generated prompt
2. A structured breakdown showing how each COAST element is addressed
3. Usage tips for getting the best results
4. 2-3 alternative variations of the prompt
5. A confidence score (0.0-1.0) for how well the prompt addresses the requirements

# **Output Format**:
Return your results in the following JSON format:
{
    "generated_prompt": "the complete prompt here, output format: ## Context: ## Objectives: ## Action: ## Support: ## Technology:",
    "prompt_structure": {
        "context": "how context is addressed",
        "objectives": "what objectives are defined",
        "action": "what actions are specified",
        "support": "what support is provided",
        "technology": "technical considerations"
    },
    "usage_tips": ["tip 1", "tip 2", "tip 3"],
    "alternatives": ["alternative prompt 1", "alternative prompt 2"],
    "confidence_score": 0.0-1.0
}
"""

        try:
            class PromptGenerationSchema(BaseModel):
                generated_prompt: str
                prompt_structure: Dict[str, str]
                usage_tips: List[str]
                alternatives: List[str]
                confidence_score: str

            client = self.get_client(request.api_key, request.base_url)
            response = client.chat.completions.create(
                model=request.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=request.max_tokens,
                temperature=0.7,
                response_format={
                    "type": "json_schema",
                    "json_schema": {
                        "name": "PromptGenerationSchema",
                        "schema": PromptGenerationSchema.model_json_schema()
                    }
                },
            )
            
            content = response.choices[0].message.content
            import json
            try:
                result = json.loads(content)
            except json.JSONDecodeError:
                result = {
                    "generated_prompt": content,
                    "prompt_structure": {
                        "context": "Based on user requirements",
                        "objectives": "Address the specified task",
                        "action": "Follow instructions provided",
                        "support": "General guidance included",
                        "technology": "Standard prompt engineering"
                    },
                    "usage_tips": ["Review the prompt for clarity", "Test with sample inputs", "Adjust based on results"],
                    "alternatives": ["Simplified version of the prompt", "More detailed version of the prompt"],
                    "confidence_score": "0.7"
                }
            
            return {
                "generated_prompt": result["generated_prompt"],
                "prompt_structure": result["prompt_structure"],
                "usage_tips": result["usage_tips"],
                "alternatives": result["alternatives"],
                "model_used": request.model,
                "confidence_score": float(result.get("confidence_score", 0.8))
            }
            
        except Exception as e:
            raise Exception(f"Error generating prompt: {str(e)}")

    def estimate_tokens(self, text: str) -> int:
        """
        Rough estimation of tokens in text (1 token ≈ 4 characters)
        """
        return len(text) // 4