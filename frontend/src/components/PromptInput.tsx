import React, { useState } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { apiService } from '../services/api';
import { PromptRequest } from '../services/api';

interface PromptInputProps {
  onOptimize: (request: PromptRequest) => void;
  loading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onOptimize, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gpt-4.1');
  const [customModel, setCustomModel] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [context, setContext] = useState('');
  const [optimizationGoal, setOptimizationGoal] = useState('general');
  const [maxTokens, setMaxTokens] = useState(2000);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [models, setModels] = React.useState<any[]>([]);
  const [optimizationTypes, setOptimizationTypes] = React.useState<any[]>([]);
  const [promptError, setPromptError] = useState('');

  React.useEffect(() => {
    loadModels();
    loadOptimizationTypes();
  }, []);

  const loadModels = async () => {
    try {
      const data = await apiService.getModels();
      setModels(data);
    } catch (error) {
      console.error('Failed to load models:', error);
      // Fallback models
      setModels([
        { model_name: 'gpt-4.1', description: 'Latest GPT-4.1 model with enhanced capabilities' },
        { model_name: 'gpt-4o', description: 'GPT-4 Omni - multimodal capabilities' },
        { model_name: 'gpt-4.1-mini', description: 'GPT-4.1 Mini - cost-effective GPT-4.1 variant' },
        { model_name: 'gpt-4o-mini', description: 'GPT-4 Omni Mini - fast and cost-effective' },
      ]);
    }
  };

  const loadOptimizationTypes = async () => {
    try {
      const data = await apiService.getOptimizationTypes();
      setOptimizationTypes(data);
    } catch (error) {
      console.error('Failed to load optimization types:', error);
      // Fallback optimization types
      setOptimizationTypes([
        { type: 'general', description: 'General optimization for clarity and effectiveness' },
        { type: 'clarity', description: 'Focus on making the prompt clearer' },
        { type: 'conciseness', description: 'Make the prompt more concise' },
        { type: 'creativity', description: 'Enhance creativity and innovation' },
        { type: 'specificity', description: 'Make the prompt more specific and detailed' }
      ]);
    }
  };

  const validatePrompt = async () => {
    // Combine prompt and context for validation to handle "## Context:" cases
    const combinedPrompt = prompt.trim();
    if (!combinedPrompt) {
      setPromptError('Please enter a prompt to optimize');
      return false;
    }
    
    // Basic client-side validation to avoid API issues with special characters
    if (combinedPrompt.length < 3) {
      setPromptError('Prompt is too short');
      return false;
    }
    if (combinedPrompt.length > 4000) {
      setPromptError('Prompt is too long');
      return false;
    }
    if (!/[a-zA-Z0-9]/.test(combinedPrompt)) {
      setPromptError('Prompt contains no alphanumeric characters');
      return false;
    }
    
    try {
      const validation = await apiService.validatePrompt(combinedPrompt);
      if (!validation.is_valid) {
        setPromptError(validation.issues.join(', '));
        return false;
      }
      setPromptError('');
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      // Allow optimization even if validation fails, but don't show error to user
      setPromptError('');
      return true;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validatePrompt();
    if (!isValid) return;

    const selectedModel = useCustomModel ? customModel : model;
    
    const request: PromptRequest = {
      prompt,
      model: selectedModel,
      context: context || undefined,
      optimization_goal: optimizationGoal,
      max_tokens: maxTokens,
      api_key: apiKey || undefined,
      base_url: baseUrl || undefined,
    };

    onOptimize(request);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
    if (promptError) setPromptError('');
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Prompt Optimizer
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Enter your prompt below and let AI help you optimize it for better results
        </Typography>

        <Box component="form" sx={{ mt: 2 }} noValidate autoComplete="off">
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Your Prompt"
            value={prompt}
            onChange={handlePromptChange}
            variant="outlined"
            margin="normal"
            placeholder="Enter your prompt here..."
            error={Boolean(promptError)}
            helperText={promptError}
            InputProps={{
              style: { fontFamily: 'monospace' }
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Additional Context (Optional)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            variant="outlined"
            margin="normal"
            placeholder="Add any additional context that might help with optimization..."
            InputProps={{
              style: { fontFamily: 'monospace' }
            }}
          />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={useCustomModel ? customModel : model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    setUseCustomModel(false);
                    setCustomModel('');
                  }}
                  label="Model"
                  disabled={useCustomModel}
                >
                  {models.map((m) => (
                    <MenuItem key={m.model_name} value={m.model_name}>
                      {m.model_name} - {m.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <input
                  type="checkbox"
                  checked={useCustomModel}
                  onChange={(e) => setUseCustomModel(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Manual input
                </Typography>
              </Box>
              
              {useCustomModel && (
                <TextField
                  fullWidth
                  value={customModel}
                  onChange={(e) => {
                    setCustomModel(e.target.value);
                    setModel(e.target.value);
                  }}
                  variant="outlined"
                  placeholder="gpt-4.1"
                  helperText="Enter any OpenAI model name"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Optimization Goal</InputLabel>
              <Select
                value={optimizationGoal}
                onChange={(e) => setOptimizationGoal(e.target.value)}
                label="Optimization Goal"
              >
                {optimizationTypes.map((type) => (
                  <MenuItem key={type.type} value={type.type}>
                    {type.type.charAt(0).toUpperCase() + type.type.slice(1)} - {type.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="number"
              label="Max Tokens"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              variant="outlined"
              sx={{ minWidth: 120 }}
              inputProps={{ min: 100, max: 4000 }}
            />
          </Box>

          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" color="primary">
                API Configuration (Optional)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="OpenAI API Key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  variant="outlined"
                  placeholder="sk-... (leave empty to use environment variable)"
                  helperText="Your OpenAI API key. Leave empty to use server configuration."
                />
                <TextField
                  fullWidth
                  label="Base URL"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  variant="outlined"
                  placeholder="https://api.openai.com/v1"
                  helperText="OpenAI API base URL. Use https://api.openai.com/v1 for OpenAI."
                />
                <Typography variant="caption" color="text.secondary">
                  Common URLs:
                  <br />• OpenAI: https://api.openai.com/v1
                  <br />• Azure OpenAI: https://your-resource.openai.azure.com/openai/deployments/[deployment]
                  <br />• Local/Custom: http://localhost:8000/v1
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              variant="contained"
              onClick={handleSubmit}
              loading={loading}
              disabled={!prompt.trim()}
              size="large"
            >
              Optimize Prompt
            </LoadingButton>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Character count: {prompt.length} | 
              Word count: {prompt.split(/\s+/).filter(Boolean).length}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PromptInput;