import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  PromptGenerationRequest,
  TaskType,
  OutputFormat,
  apiService,
} from '../services/api';

interface PromptGeneratorProps {
  onGenerate: (request: PromptGenerationRequest) => Promise<void>;
  loading: boolean;
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ onGenerate, loading }) => {
  const [requirements, setRequirements] = useState('');
  const [taskType, setTaskType] = useState('general');
  const [outputFormat, setOutputFormat] = useState('text');
  const [context, setContext] = useState('');
  const [constraints, setConstraints] = useState('');
  const [examples, setExamples] = useState<string[]>(['']);
  const [model, setModel] = useState('gpt-4.1');
  const [maxTokens, setMaxTokens] = useState(2000);

  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [outputFormats, setOutputFormats] = useState<OutputFormat[]>([]);
  const [models, setModels] = useState<{ name: string; description: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [taskTypesData, formatsData, modelsData] = await Promise.all([
        apiService.getTaskTypes(),
        apiService.getOutputFormats(),
        apiService.getModels(),
      ]);
      
      setTaskTypes(taskTypesData);
      setOutputFormats(formatsData);
      setModels(modelsData.map(m => ({ name: m.model_name, description: m.description })));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const addExample = () => {
    setExamples([...examples, '']);
  };

  const removeExample = (index: number) => {
    if (examples.length > 1) {
      const newExamples = examples.filter((_, i) => i !== index);
      setExamples(newExamples);
    }
  };

  const handleSubmit = async () => {
    if (!requirements.trim()) {
      setError('Please provide requirements for prompt generation');
      return;
    }

    const request: PromptGenerationRequest = {
      requirements,
      task_type: taskType,
      output_format: outputFormat,
      context: context || undefined,
      constraints: constraints || undefined,
      examples: examples.filter(e => e.trim()).length > 0 ? examples.filter(e => e.trim()) : undefined,
      model,
      max_tokens: maxTokens,
    };

    setError(null);
    await onGenerate(request);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Generate Prompt from Requirements
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe what you need the AI to do..."
            variant="outlined"
            required
            helperText="Describe your task, goals, and what you want the AI to accomplish"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Task Type</InputLabel>
            <Select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              label="Task Type"
            >
              {taskTypes.map((type) => (
                <MenuItem key={type.type} value={type.type}>
                  {type.type.charAt(0).toUpperCase() + type.type.slice(1)} - {type.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Output Format</InputLabel>
            <Select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              label="Output Format"
            >
              {outputFormats.map((format) => (
                <MenuItem key={format.format} value={format.format}>
                  {format.format.charAt(0).toUpperCase() + format.format.slice(1)} - {format.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Context (Optional)"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Additional background information, target audience, domain knowledge..."
            variant="outlined"
            helperText="Provide any relevant context that would help generate a better prompt"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Constraints (Optional)"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Specific limitations, word counts, technical constraints..."
            variant="outlined"
            helperText="List any constraints or limitations for the prompt"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" gutterBottom>
            Examples (Optional)
          </Typography>
          {examples.map((example, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                fullWidth
                size="small"
                label={`Example ${index + 1}`}
                value={example}
                onChange={(e) => handleExampleChange(index, e.target.value)}
                placeholder="Example of desired output or similar prompt..."
              />
              <IconButton
                onClick={() => removeExample(index)}
                disabled={examples.length === 1}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addExample}
            variant="outlined"
            size="small"
          >
            Add Example
          </Button>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Model</InputLabel>
            <Select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              label="Model"
            >
              {models.map((model) => (
                <MenuItem key={model.name} value={model.name}>
                  {model.name} - {model.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Max Tokens"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            inputProps={{ min: 100, max: 4000 }}
            helperText="Maximum tokens for the generated prompt"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading || !requirements.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Generating...' : 'Generate Prompt'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PromptGenerator;