import React from 'react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      // You can render any custom fallback UI
      return (
        <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            fontFamily: 'system-ui, sans-serif',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            color: '#334155'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('Something went wrong.')}</h1>
          <p style={{ marginBottom: '2rem' }}>{t('The application encountered an unexpected error.')}</p>
          
          <div style={{ 
              background: '#fee2e2', 
              color: '#991b1b', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              maxWidth: '800px',
              overflow: 'auto',
              marginBottom: '2rem',
              textAlign: 'left'
          }}>
             <code style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}</code>
          </div>

          <button 
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
            style={{
                padding: '10px 20px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
            }}
          >
            {t('Clear Data & Restart (Emergency Reset)')}
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
                marginTop: '10px',
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                marginLeft: '10px'
            }}
          >
            {t('Try Reloading')}
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default withTranslation()(ErrorBoundary);
