import React, { useRef, useEffect } from 'react';
import './ShaderBackground.css';

const ShaderBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    // Vertex Shader (Simple full-screen quad)
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader (Interactive minimal glow)
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;

      float random(in vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(in vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;
        
        vec2 mouse = u_mouse / u_resolution.xy;
        mouse.x *= u_resolution.x / u_resolution.y;

        // Fluid distortion
        vec2 pos = st * 3.0;
        float n = noise(pos + u_time * 0.2);
        pos += vec2(n * 0.5, noise(pos + vec2(100.0) - u_time * 0.3) * 0.5);
        float n2 = noise(pos * 2.0 - u_time * 0.5);
        
        // Mouse interaction
        float dist = length(st - mouse);
        vec2 dir = normalize(st - mouse);
        float mousePush = exp(-dist * 5.0) * 0.5;
        pos += dir * mousePush * sin(u_time * 2.0 - dist * 10.0);

        // Flow intensity
        float flow = noise(pos * 1.5 + u_time * 0.1) * n2;
        float glow = smoothstep(0.8, 0.0, dist) * 0.5;

        // Colors
        vec3 bgColor = vec3(0.01, 0.02, 0.05);
        vec3 fluidColor1 = vec3(0.1, 0.3, 0.7);
        vec3 fluidColor2 = vec3(0.4, 0.1, 0.6);
        
        vec3 color = mix(bgColor, fluidColor1, flow * 0.6);
        color = mix(color, fluidColor2, flow * glow * 3.0);
        color += fluidColor2 * glow * 0.8;
        
        // Grain
        float grain = random(gl_FragCoord.xy + u_time) * 0.03;
        color += grain - 0.015;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Full screen quad
    const vertices = new Float32Array([
      -1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0, -1.0,  1.0,  1.0
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let animationFrameId;
    const startTime = Date.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      // Invert Y axis for WebGL
      mouseY = window.innerHeight - e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      const time = (Date.now() - startTime) * 0.001;
      gl.uniform1f(timeLoc, time);
      gl.uniform2f(mouseLoc, mouseX, mouseY);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="shader-background" />;
};

export default ShaderBackground;
