# Homelab Web Portal

Un portal web personalizado y estático construido con React y Vite para la gestión y acceso seguro a los servicios del Homelab.

## Características

- **Diseño Moderno:** UI limpia con efectos tipo Glassmorphism, animaciones con GSAP y un shader de fondo reactivo al ratón.
- **Datos en Tiempo Real:** Se conecta a la API del servidor (vía `server-api`) para mostrar consumo de CPU, RAM y Uptime en tiempo real.
- **Accesos Seguros:** Tarjetas de acceso directo a los servicios multimedia y de gestión protegidos por Cloudflare Zero Trust.
- **Despliegue Rápido:** Script integrado para compilar y desplegar instantáneamente a Cloudflare Pages.

## Stack de animación y experiencia (NUEVO)

| Pieza | Uso |
|-------|-----|
| **GSAP 3.15** (+ ScrollTrigger, SplitText) | Orquestador de animaciones: parallax con `scrub`, revelados de secciones, stagger de tarjetas, tilt 3D de tarjetas, botones magnéticos |
| **three.js 0.186** | Nebulosa de partículas 3D del Hero (chunk lazy, DPR limitado, se pausa fuera de pantalla) |
| **anime.js 4** | Intro cinematográfico (una vez por sesión) con contador y barrido |
| **Lenis 1.3** | Scroll suave sincronizado con ScrollTrigger (`gsap.ticker`) |
| **WebGL Fluid** | Humo interactivo, scoped únicamente al Hero |

Notas de comportamiento:

- El **intro** se muestra una sola vez por sesión (`sessionStorage`) y se omite con `prefers-reduced-motion`.
- Todos los efectos de puntero (tilt/magnético) y el scroll suave se **desactivan** con `prefers-reduced-motion` y en dispositivos táctiles.
- El humo (WebGL) usa un **canvas singleton** que se reutiliza al navegar entre páginas (sin duplicar simulaciones).

## Estructura de Servicios
El portal actualmente enlaza a:
- **Gestión:** Proxmox VE, Portainer, Grafana.
- **Multimedia:** SwingMusic, Jellyfin.

*(Nota: Pi-hole fue retirado del portal para evitar conflictos de DNS).*

## Desarrollo

Para probar localmente:

```bash
npm install
npm run dev
```

Scripts útiles:

```bash
npm run lint     # ESLint
npm run build    # build de producción (dist/)
npm run preview  # sirve el build de producción en local
```

## Despliegue

El portal se aloja en Cloudflare Pages. Para desplegar cualquier cambio, simplemente usa el script en PowerShell desde la raíz del proyecto (en Windows):

```powershell
.\deploy-web.ps1 "Mensaje del commit"
```
Este script:
1. Sube los cambios al repositorio en GitHub.
2. Compila la aplicación para producción.
3. Despliega los estáticos usando Wrangler (Cloudflare CLI).
