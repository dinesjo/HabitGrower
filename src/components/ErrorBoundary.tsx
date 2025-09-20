import React from "react";
import { Container, Typography, Button, Paper, Box } from "@mui/material";
import { ErrorOutline, Refresh } from "@mui/icons-material";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced logging for debugging mobile Safari issues
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    console.log('Browser details when error occurred:', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
    
    // You can also log to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We're sorry, but something unexpected happened. This might be a compatibility issue with your browser.
            </Typography>
            {this.state.error && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                  {this.state.error.message}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Reload Page
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}