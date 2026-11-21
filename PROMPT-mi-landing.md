# PROMPT PARA PÁGINA WEB · Mi landing (captación de clientes)

> Versión completada de la plantilla `PROMPT PARA PAGINA WEB.md`. Es la página propia del desarrollador para captar clientes que quieran una web SPA para su negocio.

## [OBJETIVO]
Crear una SPA para **[Tu nombre]**, que diseña páginas web SPA para negocios chicos y medianos de **[Tu zona]**, que comunique "una página clara para que te encuentren y te escriban por WhatsApp" y convierta visitantes en **consultas por WhatsApp con un mensaje ya armado**. Debe transmitir confianza, claridad y cercanía. Sin promesas que no se puedan cumplir.

## [TIPO DE PÁGINA]
SPA de una sola página con navegación por anclas y scroll suave. Landing de servicio con formulario corto que abre WhatsApp. Menú fijo y transiciones suaves.

## [USUARIO]
- Perfil principal: dueños de negocios chicos y medianos (gastronomía, materiales, inmobiliarias, peluquerías, heladerías/cafeterías y similares) de la zona, de 25 a 60 años, con poco conocimiento técnico.
- Qué busca: que su negocio se vea profesional online y que los clientes lo encuentren y le escriban.
- Contexto de uso: casi siempre desde el **celular**, llegando desde Instagram o un mensaje directo.
- Nivel de conocimiento: principiante. Hay que evitar jerga técnica.

## [ACCIÓN PRINCIPAL]
Completar un formulario corto (4 preguntas) que **abre WhatsApp** al +54 9 3487 62-3501 con un mensaje prearmado según las respuestas. El CTA aparece en la barra de navegación, en el hero (visible sin scroll), después de "Cómo trabajo" y en el cierre con el formulario.

## [MATERIAL DISPONIBLE]
- Textos: a generar a partir de lo que el desarrollador hace de verdad. **No inventar cifras, clientes ni resultados.**
- Imágenes: ninguna por ahora. Sin fotos ni placeholders falsos. El hero usa una ilustración SVG decorativa.
- Logo: **no se usa** (decisión del desarrollador).
- Colores: fondo `#F7F5F0`, superficie `#FFFFFF`, texto `#1F2328`, texto secundario `#5B6370`, acento verde bosque `#2E6B4F` (hover `#245740`), borde `#E2DED4`.
- Tipografía: **Inter** (400, 500, 600, 700), local en `site/fonts/`.
- Prueba social: **no disponible, omitida.** Hay una sección de demo que queda oculta hasta cargar el link (`demoUrl` en `CFG`).
- Contacto: WhatsApp +54 9 3487 62-3501. Instagram: pendiente.

## [ESTRUCTURA]
1. **Header fijo** sin logo: enlaces + CTA. Hamburguesa en móvil.
2. **Hero**: titular, bajada, CTA principal, enlace a "Cómo trabajo" e ilustración de un celular.
3. **Problema/Beneficios**: 3 bloques con íconos SVG.
4. **Cómo trabajo** (3 pasos) y **Qué incluye** (4 puntos) + CTA.
5. **Demo** (oculta hasta tener link). Sin testimonios inventados.
6. **Precios**: omitido. El precio se pasa por WhatsApp.
7. **FAQ**: acordeón con 5 preguntas.
8. **CTA final con formulario** y estados de éxito/error.
9. **Footer**: contacto y aviso de prototipo.

## [SISTEMA DE DISEÑO]
- La paleta y la tipografía las definió el desarrollador antes de usar la skill. La búsqueda `--design-system` de `ui-ux-pro-max` devolvió "Enterprise Gateway", una paleta azul y EB Garamond (para estudios legales), que **no coinciden** con el producto. Se descartaron y se usó la paleta real.
- Detalles aplicados de la checklist de la skill: íconos SVG (sin emojis), `cursor: pointer`, transiciones de 150–300 ms, contraste mínimo 4,5:1, foco visible, `prefers-reduced-motion`, áreas táctiles de 44 px, responsive 375 / 768 / 1024 / 1440.

## [TÉCNICO]
- HTML5 + CSS3 + JavaScript vanilla, sin dependencias externas. Fuentes locales.
- Mobile-first, breakpoints 480 / 768 / 1024. Sin scroll horizontal.
- Scroll estilizado con la paleta (`scrollbar-color`, `scrollbar-width: thin`, `scrollbar-gutter: stable` y fallback WebKit) en la página y en el panel del menú móvil.
- Sin carrito: el negocio no lo necesita.
- Mensajes de WhatsApp con `wa.me`. No se guarda ningún dato del visitante.
- SEO: `title`, descripción, Open Graph y JSON-LD. **`noindex` activo** hasta reemplazar `[Tu nombre]` y `[Tu zona]`.
- Idioma: español rioplatense con voseo.

**Entregable:** carpeta `site/` lista para abrir o subir a un hosting estático.
