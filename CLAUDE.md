# Blog personal: Ghost (headless) + Astro estático

Este fichero es el contexto del proyecto. Colócalo en la raíz del repo del frontend.

## Objetivo

Blog personal con:
- **Ghost** como CMS (solo para escribir; su frontend público no se usa).
- **Astro** como frontend estático, consumiendo la Content API de Ghost en build time.
- Prioridades del usuario: excelente experiencia de edición (Ghost), control muy granular de presentación y estilo (CSS propio, sin tema impuesto), y view transitions (API nativa de Astro, `<ClientRouter />`).
- **No importa**: SEO, consumo de recursos.
- Salida final: sitio 100% estático (`dist/`) servido por nginx.

## Infraestructura existente (ya desplegada)

- VPS con **Docker Swarm**, gestionado desde **Portainer** (el usuario no puede ejecutar comandos en el host; todo se hace por la interfaz de Portainer).
- **Traefik** como reverse proxy. Red overlay externa: `proxy`. Middleware obligatorio: `waf@file`. NO usar `auth@swarm`.
  - Entrypoint `websecure` y certresolver `letsencrypt` son suposiciones: confirmar con el usuario.
- **Homepage** (dashboard): todo servicio nuevo debe registrarse con labels `homepage.*` bajo `deploy.labels`.
- Stack compartido `databases` (MySQL 8.0, red overlay `databases`, alias `mysql`). Las bases se crean con un script en `/docker-entrypoint-initdb.d/` montado como **Swarm config creada a mano en Portainer** (Swarm → Configs) y referenciada como `external: true` en el stack.
- Stack `blog` con **Ghost 6** (`ghost:6`), ya funcionando:
  - URL pública: `https://blog.dsaleh.xyz` (admin en `/ghost`).
  - URL interna entre servicios de Swarm: `http://ghost:2368` (red `proxy`).
  - Sin correo configurado (no hace falta).
  - Cuenta de administrador creada por el usuario.
- Los dos errores de ActivityPub / `mail.from` en los logs de Ghost son inofensivos.

## Convenciones al escribir stacks para Portainer

- Labels de Traefik y Homepage van bajo `deploy.labels`; `traefik.http.services.<x>.loadbalancer.server.port` es obligatorio.
- Variables del stack: se definen en "Environment variables" de Portainer. Para que Portainer no las sustituya dentro de scripts o healthchecks, escapar con `$$`.
- Los ficheros (scripts, nginx.conf...) se pasan como **Swarm configs creadas a mano por el usuario en Portainer**, no embebidas en el stack. Las configs son inmutables: para cambiar una, crear una nueva con otro nombre (`..._v2`).
- Los volúmenes son locales: fijar servicios con estado a un nodo (`node.role == manager`).
- `depends_on` se ignora en Swarm; los servicios deben tolerar reinicios mientras sus dependencias arrancan.

## Estado

Hecho:
- [x] Stack `databases` y stack `blog` (Ghost) desplegados y funcionando.
- [x] Custom integration en Ghost creada; key en `.env` local.
- [x] Proyecto Astro base: layout con `<ClientRouter />`, listado (`/`), página de post (`/[slug]/`), cliente `fetch` en `src/lib/ghost.ts`, CSS propio en `src/styles/` (tokens, base, transiciones, tarjetas Koenig).

Pendiente:
- [ ] Proyecto Astro: página de tags (opcional), RSS opcional.
- [ ] `blog.dsaleh.xyz` sirve `TRAEFIK DEFAULT CERT` (autofirmado): Let's Encrypt no ha emitido el certificado. Revisar labels `tls.certresolver` del router de Ghost y logs de Traefik.
- [ ] Imágenes de Ghost: decidir si se referencian desde `blog.dsaleh.xyz` o se descargan en el build.
- [ ] Stack `blog-frontend` en Swarm: (a) un servicio que clone el repo, haga `npm ci && npm run build` y deje `dist/` en un volumen; (b) nginx sirviendo ese volumen detrás de Traefik (`waf@file`, labels de Homepage). Scripts y nginx.conf como configs a mano en Portainer.
- [ ] Servicio receptor del webhook de rebuild (valida la cabecera `X-Ghost-Signature`, HMAC-SHA256 del cuerpo con el secret) y lanza el build. Debe compartir la red `proxy` con Ghost y se llama por URL interna `http://...`, sin pasar por Traefik ni el WAF.
- [ ] En Ghost: crear el webhook (evento `Site changed (rebuild)`) apuntando a ese servicio, con un secret aleatorio alfanumérico de 32+ caracteres. Opcional: rebuild también al hacer push al repo.
- [ ] Probar que el WAF (`waf@file`) no bloquea subidas de imágenes ni guardado de posts en `/ghost`; si da 403, ajustar sus reglas para esa ruta.

## Notas para desarrollo local

- Para desarrollar en local se usa la URL pública `https://blog.dsaleh.xyz` con la Content API key; si el WAF bloquea las peticiones a `/ghost/api/content/`, avisar al usuario.
- Dentro del Swarm, el build debe usar `http://ghost:2368`.
- Nunca commitear claves, secrets ni contraseñas.
