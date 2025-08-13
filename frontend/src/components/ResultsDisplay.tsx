import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { PromptResponse } from '../services/api';

interface ResultsDisplayProps {
  result: PromptResponse | null;
  loading: boolean;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, loading }) => {
  if (loading) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Optimized Result
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Optimizing your prompt...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Optimized Result
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Enter a prompt and click "Optimize Prompt" to see results
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Optimization Results
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Original Prompt
            </Typography>
            <Box
              sx={{
                p: 1,
                bgcolor: 'grey.50',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {result.original_prompt}
            </Box>
          </Paper>

          <Paper elevation={1} sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6" gutterBottom color="success.main">
              Optimized Prompt
            </Typography>
            <Box
              sx={{
                p: 1,
                bgcolor: 'success.light',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {result.optimized_prompt}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ mt: 3, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<TrendingUpIcon />}
            label={`${result.tokens_saved} tokens saved`}
            color={result.tokens_saved > 0 ? 'success' : 'default'}
            variant="outlined"
          />
          <Chip
            icon={<PsychologyIcon />}
            label={`${Math.round(result.confidence_score * 100)}% confidence`}
            color={result.confidence_score > 0.8 ? 'success' : 'warning'}
            variant="outlined"
          />
          <Chip
            label={`Model: ${result.model_used}`}
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Reasoning
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {result.reasoning}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>
            Suggestions
          </Typography>
          <List dense>
            {result.suggestions.map((suggestion, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <LightbulbIcon color="warning" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={suggestion}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ResultsDisplay;