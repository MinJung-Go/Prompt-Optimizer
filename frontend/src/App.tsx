import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Alert, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  AppBar,
  Toolbar,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Psychology as PsychologyIcon,
  Settings as SettingsIcon,
  AutoFixHigh as AutoFixHighIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import PromptInput from './components/PromptInput';
import ResultsDisplay from './components/ResultsDisplay';
import PromptGenerator from './components/PromptGenerator';
import GeneratedPromptDisplay from './components/GeneratedPromptDisplay';
import { apiService } from './services/api';
import { PromptRequest, PromptResponse, PromptGenerationRequest, PromptGenerationResponse } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    mode: 'light',
  },
  typography: {
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [optimizeResult, setOptimizeResult] = useState<PromptResponse | null>(null);
  const [generateResult, setGenerateResult] = useState<PromptGenerationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleOptimize = async (request: PromptRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.optimizePrompt(request);
      setOptimizeResult(response);
      setSnackbar({
        open: true,
        message: 'Prompt optimized successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to optimize prompt';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (request: PromptGenerationRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.generatePrompt(request);
      setGenerateResult(response);
      setSnackbar({
        open: true,
        message: 'Prompt generated successfully!',
        severity: 'success'
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate prompt';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <PsychologyIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AI Prompt Optimizer
            </Typography>
            <SettingsIcon />
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="prompt optimizer tabs">
              <Tab 
                label="Prompt Optimizer" 
                icon={<AutoFixHighIcon />} 
                {...a11yProps(0)} 
              />
              <Tab 
                label="Prompt Generator" 
                icon={<CreateIcon />} 
                {...a11yProps(1)} 
              />
            </Tabs>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 4 }}>
              <PromptInput 
                onOptimize={handleOptimize} 
                loading={loading} 
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <ResultsDisplay 
                result={optimizeResult} 
                loading={loading} 
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 4 }}>
              <PromptGenerator 
                onGenerate={handleGenerate} 
                loading={loading} 
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <GeneratedPromptDisplay 
                result={generateResult} 
                loading={loading} 
              />
            </Box>
          </TabPanel>

          <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              Built with FastAPI, React, and OpenAI
            </Typography>
          </Box>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ThemeProvider>
  );
}

export default App;
