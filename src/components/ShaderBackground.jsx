import React, { useRef, useEffect } from 'react';
import fluid from 'webgl-fluid';
import './ShaderBackground.css';

const ShaderBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    
    // Initialize WebGL Fluid Simulation
    // Using custom colors to match the Homelab portal theme (slate/dark blue and purple/cyan)
    fluid(canvas, {
      IMMEDIATE: false, // Prevent the explosion on load
      TRIGGER: 'hover', // Can be 'click' or 'hover'
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 1024,
      CAPTURE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 1,
      VELOCITY_DISSIPATION: 0.2,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 30,
      SPLAT_RADIUS: 0.25,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLORFUL: true,
      COLOR_UPDATE_SPEED: 10,
      PAUSED: false,
      BACK_COLOR: { r: 2, g: 5, b: 12 }, // Extremely dark blue #02050c
      TRANSPARENT: false,
      BLOOM: true,
      BLOOM_ITERATIONS: 8,
      BLOOM_RESOLUTION: 256,
      BLOOM_INTENSITY: 0.8,
      BLOOM_THRESHOLD: 0.6,
      BLOOM_SOFT_KNEE: 0.7,
      SUNRAYS: true,
      SUNRAYS_RESOLUTION: 196,
      SUNRAYS_WEIGHT: 1.0,
    });

    // Forward mouse events from window to canvas so fluid works behind UI
    const forwardEvent = (e) => {
      if (e.target === canvas) return;
      const evt = new MouseEvent(e.type, {
        clientX: e.clientX,
        clientY: e.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });
      canvas.dispatchEvent(evt);
    };

    window.addEventListener('mousemove', forwardEvent);
    window.addEventListener('mousedown', forwardEvent);
    window.addEventListener('mouseup', forwardEvent);
    window.addEventListener('touchstart', forwardEvent, { passive: true });
    window.addEventListener('touchmove', forwardEvent, { passive: true });
    window.addEventListener('touchend', forwardEvent);

    return () => {
      window.removeEventListener('mousemove', forwardEvent);
      window.removeEventListener('mousedown', forwardEvent);
      window.removeEventListener('mouseup', forwardEvent);
      window.removeEventListener('touchstart', forwardEvent);
      window.removeEventListener('touchmove', forwardEvent);
      window.removeEventListener('touchend', forwardEvent);
    };
  }, []);

  return <canvas ref={canvasRef} className="shader-background" />;
};

export default ShaderBackground;
