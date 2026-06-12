# Homelab Web Portal

Un portal web personalizado y estático construido con React y Vite para la gestión y acceso seguro a los servicios del Homelab.

## Características

- **Diseño Moderno:** UI limpia con efectos tipo Glassmorphism, animaciones con GSAP y un shader de fondo reactivo al ratón.
- **Datos en Tiempo Real:** Se conecta a la API del servidor (vía `server-api`) para mostrar consumo de CPU, RAM y Uptime en tiempo real.
- **Accesos Seguros:** Tarjetas de acceso directo a los servicios multimedia y de gestión protegidos por Cloudflare Zero Trust.
- **Despliegue Rápido:** Script integrado para compilar y desplegar instantáneamente a Cloudflare Pages.

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

## Despliegue

El portal se aloja en Cloudflare Pages. Para desplegar cualquier cambio, simplemente usa el script en PowerShell desde la raíz del proyecto (en Windows):

```powershell
.\deploy-web.ps1 "Mensaje del commit"
```
Este script:
1. Sube los cambios al repositorio en GitHub.
2. Compila la aplicación para producción.
3. Despliega los estáticos usando Wrangler (Cloudflare CLI).
