import { Component, Suspense, lazy } from 'react';

// NUEVO: carga segura de la escena 3D.
// Si el chunk de three.js no se puede descargar (red lenta, bloqueo, etc.)
// el ErrorBoundary lo captura y la web sigue funcionando sin la nebulosa.
const Hero3D = lazy(() => import('./Hero3D'));

class Hero3DBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    // Aviso, no error: el sitio degrada sin 3D y sigue siendo usable
    console.warn('[Hero3D] escena 3D no disponible:', error && error.message);
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

const Safe3D = ({ className = 'hero-3d' }) => (
  <Hero3DBoundary>
    <Suspense fallback={null}>
      <Hero3D className={className} />
    </Suspense>
  </Hero3DBoundary>
);

export default Safe3D;
