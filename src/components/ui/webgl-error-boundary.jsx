import { Component } from 'react'

export class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('[WebGL] Falha ao iniciar o canvas:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export function WebGLFallback({ className = '' }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#777',
        fontFamily: 'Space Mono, monospace',
        fontSize: '0.8rem',
        letterSpacing: '0.08em',
      }}
    >
      <p>WEBGL INDISPONÍVEL NESTE NAVEGADOR</p>
    </div>
  )
}
