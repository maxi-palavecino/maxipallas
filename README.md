# Mi landing · página de captación de clientes

Carpeta propia dentro de `negocios/`. Es la página que usás para que los dueños de negocios te escriban por WhatsApp.

```
mi-landing/
├── README.md               ← este archivo
├── PROMPT-mi-landing.md    ← prompt completado a partir de la plantilla
├── assets/images/          ← fotos o íconos propios (vacía por ahora)
└── site/                   ← la página (lo único que se publica)
    ├── index.html
    ├── css/styles.css      ← colores en :root
    ├── js/app.js           ← configuración arriba de todo (CFG)
    └── fonts/              ← Inter 400/500/600/700 (licencia OFL incluida)
```

## Verla
Abrí `site/index.html` con doble clic. Funciona sin internet.

## Cambiar cosas
- **Nombre, WhatsApp, Instagram, demo y Google Analytics**: arriba de `site/js/app.js` (`CFG`). Ahí se cambian los datos y se activa GA4 pegando tu ID (`gaId: "G-..."`).
- **Demo**: cuando tengas la página lista, pegá su link en `demoUrl` y la sección aparece sola, junto con el enlace del menú.
- **Colores**: variables al comienzo de `site/css/styles.css` (`:root`).
- **Textos de las preguntas del formulario**: en `index.html`, bloque `#formContacto`. Cada opción tiene `value`, que es lo que entra en el mensaje de WhatsApp.

## Publicar en Cloudflare Pages (desde GitHub)
1. Conectar el repositorio `maxi-palavecino/maxipallas` en **Workers & Pages -> Pages**.
2. Dejar **Build command** vacío y poner **Build output directory**: `site`.
3. Una vez que tengas la URL publicada, crear el flujo web en Google Analytics 4 y pegar el ID (`G-...`) en `gaId` dentro de `site/js/app.js`.
4. Probar en un celular que no sea el tuyo que el botón abra WhatsApp con el número correcto.
5. Si querés mostrar a Bluma como demo, pedirle permiso antes de usar su nombre y pegar su URL en `demoUrl` dentro de `site/js/app.js`.

## Decisiones tomadas
- Sin logo (decisión del desarrollador).
- Sin testimonios, cifras ni casos: todavía no hay datos reales. La sección de demo queda oculta hasta cargar el link.
- Sin precios: se pasan por WhatsApp.
- No se guarda ningún dato del visitante.

## Sin verificar todavía
No se probó en navegadores ni con auditoría de accesibilidad automática. Revisá en 375, 768 y 1440 px, que no haya scroll horizontal y que el menú móvil y el formulario funcionen con teclado.
