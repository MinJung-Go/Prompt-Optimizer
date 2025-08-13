import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export interface PromptRequest {
  prompt: string;
  model: string;
  context?: string;
  optimization_goal: string;
  max_tokens?: number;
  api_key?: string;
  base_url?: string;
}

export interface ConfigRequest {
  api_key?: string;
  base_url?: string;
}

export interface PromptResponse {
  original_prompt: string;
  optimized_prompt: string;
  suggestions: string[];
  reasoning: string;
  model_used: string;
  tokens_saved: number;
  confidence_score: number;
}

export interface ModelInfo {
  model_name: string;
  description: string;
  max_tokens: number;
  pricing_per_1k_tokens: {
    input: number;
    output: number;
  };
}

export interface OptimizationType {
  type: string;
  description: string;
}

export interface PromptGenerationRequest {
  requirements: string;
  task_type: string;
  output_format: string;
  context?: string;
  constraints?: string;
  examples?: string[];
  model: string;
  max_tokens?: number;
  api_key?: string;
  base_url?: string;
}

export interface PromptGenerationResponse {
  generated_prompt: string;
  prompt_structure: {
    context: string;
    objectives: string;
    action: string;
    support: string;
    technology: string;
  };
  usage_tips: string[];
  alternatives: string[];
  model_used: string;
  confidence_score: number;
}

export interface TaskType {
  type: string;
  description: string;
}

export interface OutputFormat {
  format: string;
  description: string;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 120000, // Increased to 2 minutes for OpenAI API calls
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async optimizePrompt(request: PromptRequest): Promise<PromptResponse> {
    try {
      const response = await this.api.post('/optimize', request);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - the OpenAI API is taking too long to respond. Please try again or check your API key.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error - please check if the backend service is running and your API key is valid.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed - please check your OpenAI API key.');
      } else {
        throw new Error(`Request failed: ${error.response?.data?.detail || error.message}`);
      }
    }
  }

  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.api.get('/models');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - unable to fetch models. Please check your connection.');
      } else {
        throw new Error(`Failed to fetch models: ${error.response?.data?.detail || error.message}`);
      }
    }
  }

  async getOptimizationTypes(): Promise<OptimizationType[]> {
    try {
      const response = await this.api.get('/optimization/types');
      return response.data.types;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - unable to fetch optimization types. Please check your connection.');
      } else {
        throw new Error(`Failed to fetch optimization types: ${error.response?.data?.detail || error.message}`);
      }
    }
  }

  async validatePrompt(prompt: string): Promise<{
    is_valid: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    try {
      const response = await this.api.post('/validate', { prompt });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - validation is taking too long. Please try again.');
      } else {
        throw new Error(`Validation failed: ${error.response?.data?.detail || error.message}`);
      }
    }
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    try {
      const response = await this.api.get('/health');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Health check timeout - unable to reach backend service.');
      } else {
        throw new Error(`Health check failed: ${error.response?.data?.detail || error.message}`);
      }
    }
  }

  async generatePrompt(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    try {
      const response = await this.api.post('/generate', request);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - the OpenAI API is taking too long to respond. Please try again or check your API key.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error - please check if the backend service is running and your API key is valid.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed - please check your OpenAI API key.');
      } else {
        throw new Error(`Request failed: ${error.response?.data?.detail || error.message}`);
      }
    }
  }

  async getTaskTypes(): Promise<TaskType[]> {
    try {
      const response = await this.api.get('/task-types');
      return response.data.types;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - unable to fetch task types. Please check your connection.');
      } else {
        throw new Error(`Failed to fetch task types: ${error.response?.data?.detail || error.message}`);
      }
    }
  }

  async getOutputFormats(): Promise<OutputFormat[]> {
    try {
      const response = await this.api.get('/output-formats');
      return response.data.formats;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - unable to fetch output formats. Please check your connection.');
      } else {
        throw new Error(`Failed to fetch output formats: ${error.response?.data?.detail || error.message}`);
      }
    }
  }
}

export const apiService = new ApiService();