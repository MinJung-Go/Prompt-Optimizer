import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: {
    apiKey: string;
    baseUrl: string;
    modelName: string;
  }) => void;
  initialConfig: {
    apiKey: string;
    baseUrl: string;
    modelName: string;
  };
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  open,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [apiKey, setApiKey] = useState(initialConfig.apiKey);
  const [baseUrl, setBaseUrl] = useState(initialConfig.baseUrl);
  const [modelName, setModelName] = useState(initialConfig.modelName);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSave({ apiKey, baseUrl, modelName });
    onClose();
  };

  const handleReset = () => {
    setApiKey('');
    setBaseUrl('https://api.openai.com/v1');
    setModelName('gpt-4.1');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            API Configuration
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Configure your OpenAI API credentials. These settings will be used for all requests.
          </Alert>
          
          <TextField
            fullWidth
            label="OpenAI API Key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            variant="outlined"
            margin="normal"
            helperText="Your OpenAI API key. Leave empty to use environment variable."
            InputProps={{
              endAdornment: (
                <Button
                  size="small"
                  onClick={() => setShowKey(!showKey)}
                  sx={{ minWidth: 'auto' }}
                >
                  {showKey ? 'Hide' : 'Show'}
                </Button>
              ),
            }}
          />
          
          <TextField
            fullWidth
            label="Base URL"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            variant="outlined"
            margin="normal"
            helperText="OpenAI API base URL. Use https://api.openai.com/v1 for OpenAI."
            placeholder="https://api.openai.com/v1"
          />
          
          <TextField
            fullWidth
            label="Model Name"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            variant="outlined"
            margin="normal"
            helperText="OpenAI model name to use for requests."
            placeholder="gpt-4.1"
          />
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Common URLs:
            <br />• OpenAI: https://api.openai.com/v1
            <br />• Azure OpenAI: https://your-resource.openai.azure.com/openai/deployments/{'{deployment-name}'}
            <br />• Local/Custom: http://localhost:8000/v1
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleReset} color="inherit">
          Reset
        </Button>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigModal;