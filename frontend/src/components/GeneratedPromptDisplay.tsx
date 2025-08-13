import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Alert,
  IconButton,
  Tooltip,
  Grid,
  TextField,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { PromptGenerationResponse } from '../services/api';

interface GeneratedPromptDisplayProps {
  result: PromptGenerationResponse | null;
  loading: boolean;
}

const GeneratedPromptDisplay: React.FC<GeneratedPromptDisplayProps> = ({ result, loading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const content = `
# Generated Prompt

## Main Prompt
${result.generated_prompt}

## Prompt Structure
- **Context**: ${result.prompt_structure.context}
- **Objectives**: ${result.prompt_structure.objectives}
- **Action**: ${result.prompt_structure.action}
- **Support**: ${result.prompt_structure.support}
- **Technology**: ${result.prompt_structure.technology}

## Usage Tips
${result.usage_tips.map(tip => `- ${tip}`).join('\n')}

## Alternative Prompts
${result.alternatives.map((alt, i) => `### Alternative ${i + 1}\n${alt}`).join('\n\n')}

## Metadata
- Model: ${result.model_used}
- Confidence Score: ${(result.confidence_score * 100).toFixed(1)}%
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-prompt.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Generating Your Prompt...
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Creating a high-quality prompt based on your requirements...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!result) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Generated Prompt
        </Typography>
        <Alert severity="info">
          Click "Generate Prompt" to create a prompt based on your requirements.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Generated Prompt
        </Typography>
        <Box>
          <Tooltip title="Download as Markdown">
            <IconButton onClick={handleDownload} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2">
              <strong>Model</strong>: {result.model_used} | <strong>Confidence</strong>: {(result.confidence_score * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Alert>

      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Generated Prompt</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              multiline
              rows={6}
              value={result.generated_prompt}
              variant="outlined"
              InputProps={{
                readOnly: true,
              }}
              sx={{ mb: 1 }}
            />
            <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton
                onClick={() => handleCopy(result.generated_prompt)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                color={copied ? 'success' : 'default'}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Prompt Structure (COAST Framework)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {Object.entries(result.prompt_structure).map(([key, value]) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                  <Typography variant="body2">{value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Usage Tips</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {result.usage_tips.map((tip, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText primary={tip} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Alternative Prompts</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {result.alternatives.map((alternative, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Alternative {index + 1}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton
                      onClick={() => handleCopy(alternative)}
                      size="small"
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">{alternative}</Typography>
                </Paper>
              </Box>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default GeneratedPromptDisplay;