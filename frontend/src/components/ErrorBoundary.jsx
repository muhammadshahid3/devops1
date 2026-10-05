import { Component } from 'react';

// Shows the real error on screen instead of a blank page
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ maxWidth: 760, margin: '60px auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: 26, marginBottom: 12 }}>Something went wrong on this page</h1>
        <p style={{ marginBottom: 12 }}>Please copy the message below and send it to the developer:</p>
        <pre style={{ background: '#fbe8e4', color: '#7d2418', padding: 16, borderRadius: 12, whiteSpace: 'pre-wrap', overflow: 'auto' }}>
          {String(this.state.error?.stack || this.state.error)}
        </pre>
        <button onClick={() => window.location.assign('/')} style={{ marginTop: 16, padding: '10px 18px', borderRadius: 10, border: 0, background: '#0e5a4a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          Back to home
        </button>
      </div>
    );
  }
}
