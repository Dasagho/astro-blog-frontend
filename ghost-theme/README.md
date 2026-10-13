# Tema Ghost `dsaleh-blog`

Réplica visual del frontend Astro. Los ficheros están en la raíz de esta carpeta
(`package.json`, `default.hbs`, `index.hbs`, `post.hbs`...).

## Crear el zip

El `package.json` tiene que quedar en la **raíz del zip**, no dentro de una subcarpeta:

    cd ghost-theme
    zip -r ../dsaleh-blog.zip . -x README.md -x ".*"

(En el explorador de ficheros: entra en la carpeta, selecciona todo su contenido y comprímelo, no la carpeta.)

## Subirlo

Ghost Admin → Settings → Design & branding → Change theme → Upload theme → Activate.
Antes de activarlo, edita `author.email` en `package.json`.

## Ajustes en Ghost

- Settings → General → Publication language: `es` (fechas en español y `<html lang>`).
- Navegación: Settings → Navigation (menú principal y secundario). Colores: el color de acento sale de Design & branding.
- Si cambias algo del tema, vuelve a subir el zip con el mismo nombre de tema: lo sustituye.
