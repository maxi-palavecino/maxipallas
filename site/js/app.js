/* ==========================================================================
   Mi landing · lógica
   Todo lo que cambia (nombre, WhatsApp, Instagram, demo, Google Analytics) está en CFG.
   ========================================================================== */

const CFG = {
  nombre: "Maximiliano Palavecino",
  whatsapp: "5493487623501",          // sin +, sin espacios, sin 0 ni 15
  whatsappVisible: "+54 9 3487 62-3501",
  instagram: "maxi.pallas",           // usuario sin @. Vacío = no se muestra
  demoUrl: "",                        // link a la demo. Vacío = la sección de demo queda oculta
  gaId: "G-WNCHT6VZH0",               // ID de Google Analytics 4 (ej: "G-ABC123DEF4"). Vacío = inactivo
  mensajeInicial: "Hola, vi tu página y quiero una web para mi negocio"
};

(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const waUrl = (texto) => "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(texto);

  /* ---- 0. Google Analytics 4 (solo si CFG.gaId tiene un ID real) ---- */
  let gaReady = false;
  function initAnalytics() {
    const id = (CFG.gaId || "").trim();
    if (!id || !/^G-[A-Z0-9]+$/i.test(id) || /^G-X+$/i.test(id)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id);
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    gaReady = true;
  }

  function trackEvent(name, params) {
    if (!gaReady || typeof window.gtag !== "function") return;
    window.gtag("event", name, params || {});
  }

  initAnalytics();

  /* ---- 1. Datos de CFG en la página ---- */
  $$("[data-cfg]").forEach((el) => {
    const key = el.getAttribute("data-cfg");
    if (CFG[key]) el.textContent = CFG[key];
  });

  // Enlaces de contacto con ícono (footer y bloque de contacto)
  $$("[data-wa]").forEach((a) => {
    a.href = waUrl(CFG.mensajeInicial);
    a.addEventListener("click", () => trackEvent("whatsapp_click", { origen: "contacto_directo" }));
    const t = $("[data-wa-text]", a);
    if (t) t.textContent = CFG.whatsappVisible;
  });

  $$("[data-ig]").forEach((a) => {
    if (!CFG.instagram) { a.hidden = true; return; }
    a.href = "https://instagram.com/" + CFG.instagram;
    const t = $("[data-ig-text]", a);
    if (t) t.textContent = "@" + CFG.instagram;
  });

  if (CFG.demoUrl) {
    $("#demo").hidden = false;
    const demoLink = $("#demoLink");
    demoLink.href = CFG.demoUrl;
    demoLink.addEventListener("click", () => trackEvent("demo_click", { url: CFG.demoUrl }));
    $$("[data-demo]").forEach((li) => (li.hidden = false));
  }

  // Año actual en el copyright del footer
  const copyYear = $("#copyYear");
  if (copyYear) copyYear.textContent = String(new Date().getFullYear());

  /* ---- 2. Header: borde al hacer scroll ---- */
  const header = $("#header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- 3. Menú móvil ---- */
  const toggle = $("#navToggle");
  const panel = $("#navPanel");

  function setMenu(open) {
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", panel).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---- 4. Scroll suave con respaldo en JS ---- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nativeSmooth = "scrollBehavior" in document.documentElement.style;
  if (!nativeSmooth && !reduceMotion) {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = id.length > 1 ? $(id) : null;
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 60 });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---- 5. Animaciones de entrada ---- */
  const reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -24px 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---- 6. Formulario → WhatsApp + vista previa en vivo ---- */
  const form = $("#formContacto");
  const status = $("#formStatus");
  const previewBox = $("#msgPreview");
  const previewText = $("#msgPreviewText");
  const previewPlaceholder = "Elegí tu rubro y lo que necesitás para generar tu mensaje listo para enviar.";

  function joinListEs(items) {
    if (items.length <= 1) return items[0] || "";
    if (items.length === 2) return items[0] + " y " + items[1];
    return items.slice(0, -1).join(", ") + " y " + items[items.length - 1];
  }

  function buildWhatsAppMessage(data) {
    const nombre = (data.get("nombre") || "").toString().trim();
    const referencia = (data.get("referencia") || "").toString().trim();
    const rubro = data.get("rubro");
    const necesidades = data.getAll("necesidad").filter(Boolean);
    const situaciones = data.getAll("situacion").filter(Boolean);
    const plazo = data.get("plazo");

    if (!rubro && !necesidades.length) return "";

    const partes = [];
    partes.push(nombre ? "Hola, soy " + nombre + "." : "Hola, vi tu página.");

    const rubroTexto = rubro === "inmobiliaria"
      ? "Tengo una inmobiliaria"
      : rubro ? "Tengo un negocio de " + rubro : "";
    const necesidadTexto = necesidades.length ? joinListEs(necesidades) : "";

    if (rubroTexto && necesidadTexto) {
      partes.push(rubroTexto + " y necesito " + necesidadTexto + ".");
    } else if (rubroTexto) {
      partes.push(rubroTexto + ".");
    } else if (necesidadTexto) {
      partes.push("Necesito " + necesidadTexto + ".");
    }

    if (situaciones.length) {
      if (situaciones.includes("nada online")) {
        partes.push("Hoy no tengo presencia online.");
      } else {
        partes.push("Hoy me encuentran por " + joinListEs(situaciones) + ".");
      }
    }
    if (referencia) partes.push("Mi perfil o web actual es: " + referencia + ".");
    if (plazo) {
      partes.push(plazo === "solo estoy evaluando opciones"
        ? "Por ahora estoy evaluando opciones."
        : "Quiero empezar " + plazo + ".");
    }
    partes.push("¿Podemos agendar una charla?");
    return partes.join(" ");
  }

  function updatePreview() {
    if (!form || !previewBox || !previewText) return;
    const data = new FormData(form);
    const msg = buildWhatsAppMessage(data);
    const ready = Boolean(data.get("rubro") && data.getAll("necesidad").length);
    previewBox.classList.toggle("is-ready", ready);
    previewText.textContent = msg || previewPlaceholder;
  }

  function showStatus(kind, html) {
    if (!status) return;
    status.className = "status " + (kind === "error" ? "is-error" : "is-ok");
    status.innerHTML = html;
  }

  if (form) {
    const steps = $$(".wizard-step", form);
    const wizardProgress = $("#wizardProgress");
    const wizardNav = $("#wizardNav");
    const stepLabel = $("#wizardStepLabel");
    const stepTag = $("#wizardStepTag");
    const progressFill = $("#wizardProgressFill");
    const prevBtn = $("#wizardPrev");
    const nextBtn = $("#wizardNext");
    let currentStep = 0;

    function clearStatus() {
      if (!status) return;
      status.className = "status";
      status.textContent = "";
    }

    function showStep(idx) {
      if (!steps.length) return;
      currentStep = Math.max(0, Math.min(steps.length - 1, idx));
      steps.forEach((s, i) => s.classList.toggle("is-active", i === currentStep));

      if (stepLabel) stepLabel.textContent = "Paso " + (currentStep + 1) + " de " + steps.length;
      if (progressFill) progressFill.style.width = (((currentStep + 1) / steps.length) * 100) + "%";
      if (stepTag) {
        const isReq = currentStep === 0 || currentStep === 1;
        const isFinal = currentStep === steps.length - 1;
        stepTag.textContent = isFinal ? "Listo para enviar" : isReq ? "Obligatorio" : "Opcional";
        stepTag.classList.toggle("is-req", isReq || isFinal);
      }
      if (prevBtn) prevBtn.hidden = currentStep === 0;
      if (nextBtn) nextBtn.hidden = currentStep === steps.length - 1;
      clearStatus();
    }

    function validateStep(idx) {
      const data = new FormData(form);
      $$("fieldset", form).forEach((fs) => fs.classList.remove("has-error"));

      if (idx === 0 && !data.get("rubro")) {
        const fs = $('fieldset[data-group="rubro"]', form);
        if (fs) fs.classList.add("has-error");
        showStatus("error", "Elegí el rubro de tu negocio para seguir.");
        const first = fs ? $("input", fs) : null;
        if (first) first.focus();
        return false;
      }

      if (idx === 1 && !data.getAll("necesidad").length) {
        const fs = $('fieldset[data-group="necesidad"]', form);
        if (fs) fs.classList.add("has-error");
        showStatus("error", "Elegí al menos una opción de lo que querés lograr.");
        const first = fs ? $("input", fs) : null;
        if (first) first.focus();
        return false;
      }

      return true;
    }

    if (steps.length) {
      form.classList.add("is-wizard");
      if (wizardProgress) wizardProgress.hidden = false;
      if (wizardNav) wizardNav.hidden = false;
      showStep(0);

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          if (validateStep(currentStep)) showStep(currentStep + 1);
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener("click", () => showStep(currentStep - 1));
      }
      $$('input[type="text"]', form).forEach((inp) => {
        inp.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (currentStep < steps.length - 1 && nextBtn) nextBtn.click();
          }
        });
      });
    }

    const onFormChange = (e) => {
      // "No tengo presencia" es excluyente frente a tener redes, Maps o web
      if (e && e.target && e.target.name === "situacion" && e.target.checked) {
        const sitInputs = $$('input[name="situacion"]', form);
        if (e.target.value === "nada online") {
          sitInputs.forEach((inp) => { if (inp !== e.target) inp.checked = false; });
        } else {
          sitInputs.forEach((inp) => { if (inp.value === "nada online") inp.checked = false; });
        }
      }
      $$("fieldset.has-error", form).forEach((fs) => {
        if ($("input:checked", fs)) fs.classList.remove("has-error");
      });
      if (status && status.classList.contains("is-error") && !$$("fieldset.has-error", form).length) {
        clearStatus();
      }
      updatePreview();
    };

    form.addEventListener("input", onFormChange);
    form.addEventListener("change", onFormChange);

    updatePreview();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);

      // Validación: tipo de negocio y al menos una necesidad son obligatorios
      const missing = ["rubro", "necesidad"].filter((n) => !data.getAll(n).length);
      $$("fieldset", form).forEach((fs) => fs.classList.remove("has-error"));
      if (missing.length) {
        if (steps.length) showStep(missing[0] === "rubro" ? 0 : 1);
        missing.forEach((n) => $('fieldset[data-group="' + n + '"]', form).classList.add("has-error"));
        showStatus("error", "Falta elegir " + (missing.length === 2 ? "el tipo de negocio y al menos una opción de lo que necesitás" : missing[0] === "rubro" ? "el tipo de negocio" : "al menos una opción de lo que necesitás") + ".");
        const first = $('fieldset[data-group="' + missing[0] + '"] input', form);
        if (first) first.focus();
        return;
      }

      const url = waUrl(buildWhatsAppMessage(data));
      trackEvent("whatsapp_click", { origen: "formulario", rubro: data.get("rubro") || "" });
      const win = window.open(url, "_blank", "noopener");

      showStatus("ok", win
        ? "Listo, se abrió WhatsApp con tu mensaje. Si no lo ves, <a href=\"" + url + "\" target=\"_blank\" rel=\"noopener\">tocá acá para abrirlo</a>."
        : "Tocá <a href=\"" + url + "\" target=\"_blank\" rel=\"noopener\">acá para abrir WhatsApp</a> con tu mensaje.");
    });
  }

  /* ---- 7. Interacción dentro del celular de ejemplo ---- */
  const demoViewport = $("#demoViewport");
  if (demoViewport) {
    const scrollBehavior = reduceMotion ? "auto" : "smooth";

    /* Navegador del celular: URL editable, 404 y recarga siempre a cafeluna.com.ar */
    const browserBar = $("#phoneBrowserBar");
    const urlForm = $("#browserUrlForm");
    const urlInput = $("#browserUrlInput");
    const reloadBtn = $("#browserReloadBtn");
    const demoSite = $("#demoSite");
    const demoNotFound = $("#demoNotFound");
    const demo404Host = $("#demo404Host");
    const demo404BackBtn = $("#demo404BackBtn");
    let loadTimer = null;

    function triggerBrowserLoad() {
      if (!browserBar) return;
      browserBar.classList.remove("is-loading");
      void browserBar.offsetWidth;
      browserBar.classList.add("is-loading");
      clearTimeout(loadTimer);
      loadTimer = setTimeout(() => {
        browserBar.classList.remove("is-loading");
      }, 460);
    }

    function normalizeDemoUrl(raw) {
      return raw
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/+$/, "");
    }

    function navigateDemoBrowser(rawUrl) {
      const cleaned = normalizeDemoUrl(rawUrl);
      const isHome = cleaned === "cafeluna.com.ar";
      triggerBrowserLoad();

      if (urlForm) urlForm.classList.toggle("is-not-found", !isHome);
      if (demoSite) demoSite.hidden = !isHome;
      if (demoNotFound) demoNotFound.hidden = isHome;

      if (isHome) {
        if (urlInput) urlInput.value = "cafeluna.com.ar";
        demoViewport.scrollTo({ top: 0, behavior: "auto" });
      } else {
        if (demo404Host) demo404Host.textContent = rawUrl.trim() || "esa dirección";
        demoViewport.scrollTop = 0;
      }
    }

    function reloadToCafeLuna() {
      navigateDemoBrowser("cafeluna.com.ar");
      resetDemoCarousel();
    }

    if (urlForm && urlInput) {
      urlForm.addEventListener("submit", (e) => {
        e.preventDefault();
        navigateDemoBrowser(urlInput.value);
        urlInput.blur();
      });
    }
    if (reloadBtn) reloadBtn.addEventListener("click", reloadToCafeLuna);
    if (demo404BackBtn) demo404BackBtn.addEventListener("click", reloadToCafeLuna);

    $$("[data-demo-top]").forEach((btn) => {
      btn.addEventListener("click", () => {
        demoViewport.scrollTo({ top: 0, behavior: scrollBehavior });
      });
    });

    $$("[data-demo-scroll]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = $(btn.getAttribute("data-demo-scroll"), demoViewport);
        if (!target) return;
        const nav = $(".demo-site-nav", demoViewport);
        const navHeight = nav ? nav.getBoundingClientRect().height : 44;
        const viewportRect = demoViewport.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const top = demoViewport.scrollTop + (targetRect.top - viewportRect.top) - navHeight - 8;
        const maxScroll = Math.max(0, demoViewport.scrollHeight - demoViewport.clientHeight);
        demoViewport.scrollTo({
          top: Math.max(0, Math.min(maxScroll, top)),
          behavior: scrollBehavior
        });
      });
    });

    const carousel = $("#demoCarousel");
    let resetDemoCarousel = () => {};
    if (carousel) {
      const originals = $$(".demo-drink-card", carousel);
      let allCards = originals;
      let startOffset = 0;
      let setWidth = 0;
      let settleTimer = null;
      let isNormalizing = false;

      const makeClone = (card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.dataset.carouselClone = "1";
        $$("img", clone).forEach((img) => { img.loading = "eager"; });
        return clone;
      };

      const measureLoop = () => {
        if (originals.length < 2 || allCards.length <= originals.length) return;
        const firstOrig = originals[0];
        const firstAfter = allCards[originals.length * 2];
        if (!firstOrig || !firstAfter) return;
        startOffset = firstOrig.offsetLeft;
        setWidth = firstAfter.offsetLeft - firstOrig.offsetLeft;
      };

      const jumpSilent = (left) => {
        isNormalizing = true;
        carousel.style.scrollSnapType = "none";
        carousel.scrollLeft = left;
        requestAnimationFrame(() => {
          carousel.style.scrollSnapType = "";
          isNormalizing = false;
        });
      };

      const normalizeLoop = () => {
        if (!setWidth) measureLoop();
        if (!setWidth) return;
        let left = carousel.scrollLeft;
        if (left < startOffset - 2) {
          while (left < startOffset - 2) left += setWidth;
          jumpSilent(left);
        } else if (left >= startOffset + setWidth - 2) {
          while (left >= startOffset + setWidth - 2) left -= setWidth;
          jumpSilent(left);
        }
      };

      if (originals.length >= 2) {
        const beforeFrag = document.createDocumentFragment();
        const afterFrag = document.createDocumentFragment();
        originals.forEach((card) => {
          beforeFrag.appendChild(makeClone(card));
          afterFrag.appendChild(makeClone(card));
        });
        carousel.insertBefore(beforeFrag, originals[0]);
        carousel.appendChild(afterFrag);
        allCards = $$(".demo-drink-card", carousel);

        measureLoop();
        if (setWidth) jumpSilent(startOffset);

        window.addEventListener("resize", () => {
          const prevWidth = setWidth;
          const prevOffset = startOffset;
          measureLoop();
          if (setWidth && prevWidth) {
            const rel = ((carousel.scrollLeft - prevOffset) % prevWidth + prevWidth) % prevWidth;
            jumpSilent(startOffset + rel);
          }
        });

        carousel.addEventListener("scroll", () => {
          if (isNormalizing) return;
          if (!setWidth) measureLoop();
          if (!setWidth) return;
          const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
          if (carousel.scrollLeft <= 4 || carousel.scrollLeft >= maxScroll - 4) {
            normalizeLoop();
            return;
          }
          clearTimeout(settleTimer);
          settleTimer = setTimeout(normalizeLoop, 150);
        }, { passive: true });

        if ("onscrollend" in carousel) {
          carousel.addEventListener("scrollend", () => {
            if (!isNormalizing) normalizeLoop();
          });
        }
      }

      resetDemoCarousel = () => {
        if (!setWidth) measureLoop();
        carousel.scrollTo({ left: setWidth ? startOffset : 0, behavior: scrollBehavior });
      };

      $$("[data-carousel-dir]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const dir = Number(btn.getAttribute("data-carousel-dir")) || 1;
          if (!allCards.length) return;

          if (setWidth) {
            const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
            const approxStep = allCards[1] ? allCards[1].offsetLeft - allCards[0].offsetLeft : 156;
            if ((dir < 0 && carousel.scrollLeft < approxStep + 12) ||
                (dir > 0 && carousel.scrollLeft > maxScroll - approxStep - 12)) {
              normalizeLoop();
            }
          }

          const current = carousel.scrollLeft;
          const maxScroll = Math.max(0, carousel.scrollWidth - carousel.clientWidth);
          let targetLeft = current;

          if (dir > 0) {
            const nextCard = allCards.find((card) => card.offsetLeft > current + 8);
            targetLeft = nextCard ? Math.min(maxScroll, nextCard.offsetLeft) : maxScroll;
          } else {
            const prevCards = allCards.filter((card) => card.offsetLeft < current - 8);
            const prevCard = prevCards[prevCards.length - 1];
            targetLeft = prevCard ? prevCard.offsetLeft : 0;
          }

          carousel.scrollTo({ left: targetLeft, behavior: scrollBehavior });
        });
      });
    }

    const tabs = $$("[data-demo-tab]", demoViewport);
    const panels = $$("[data-demo-panel]", demoViewport);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const name = tab.getAttribute("data-demo-tab");
        tabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-selected", String(active));
        });
        panels.forEach((p) => {
          p.hidden = p.getAttribute("data-demo-panel") !== name;
        });
      });
    });

    const demoToast = $("#demoToast");
    let toastTimer = null;
    if (demoToast) {
      const showDemoToast = (text) => {
        demoToast.textContent = text;
        demoToast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          demoToast.hidden = true;
        }, 2600);
      };

      $$("[data-demo-wa]").forEach((btn) => {
        btn.addEventListener("click", () => {
          showDemoToast("Así se abriría WhatsApp directo con tu negocio.");
        });
      });

      $$("[data-demo-toast]").forEach((btn) => {
        btn.addEventListener("click", () => {
          showDemoToast(btn.getAttribute("data-demo-toast") || "Vista previa interactiva.");
        });
      });
    }

    /* Botones físicos: volumen y encendido/apagado */
    const phoneDevice = $("#phoneDevice");
    const volUpBtn = $("#phoneVolUp");
    const volDownBtn = $("#phoneVolDown");
    const powerBtn = $("#phonePower");
    const wakeBtn = $("#phoneWakeBtn");
    const offScreen = $("#phoneOffScreen");
    const volHud = $("#phoneVolumeHud");
    const volFill = $("#phoneVolumeFill");
    const volLabel = $("#phoneVolumeLabel");

    let phoneOn = true;
    let volume = 60;
    let volTimer = null;

    function hideVolumeHud() {
      if (!volHud) return;
      volHud.classList.remove("is-visible");
      volHud.setAttribute("aria-hidden", "true");
    }

    function changeVolume(delta) {
      if (!phoneOn || !volHud || !volFill || !volLabel) return;
      volume = Math.max(0, Math.min(100, volume + delta));
      volFill.style.width = volume + "%";
      volLabel.textContent = volume + "%";
      volHud.classList.toggle("is-muted", volume === 0);
      volHud.classList.add("is-visible");
      volHud.setAttribute("aria-hidden", "false");
      clearTimeout(volTimer);
      volTimer = setTimeout(hideVolumeHud, 1800);
    }

    function setPhonePower(on, fromWakeBtn) {
      phoneOn = on;
      if (phoneDevice) phoneDevice.classList.toggle("is-off", !on);
      if (offScreen) offScreen.setAttribute("aria-hidden", String(on));
      if (wakeBtn) wakeBtn.tabIndex = on ? -1 : 0;
      if (powerBtn) {
        powerBtn.setAttribute("aria-pressed", String(!on));
        powerBtn.setAttribute("aria-label", on ? "Apagar celular" : "Prender celular");
      }
      if (!on) {
        clearTimeout(volTimer);
        clearTimeout(toastTimer);
        hideVolumeHud();
        if (demoToast) demoToast.hidden = true;
      } else if (fromWakeBtn && powerBtn) {
        powerBtn.focus();
      }
    }

    if (volUpBtn) volUpBtn.addEventListener("click", () => changeVolume(10));
    if (volDownBtn) volDownBtn.addEventListener("click", () => changeVolume(-10));
    if (powerBtn) powerBtn.addEventListener("click", () => setPhonePower(!phoneOn, false));
    if (wakeBtn) wakeBtn.addEventListener("click", () => setPhonePower(true, true));

    /* Reloj en tiempo real del usuario + señal Wi-Fi cada 5 s */
    const phoneTime = $("#phoneTime");
    if (phoneTime) {
      let lastTime = "";
      const updatePhoneClock = () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const text = hh + ":" + mm;
        if (text !== lastTime) {
          lastTime = text;
          phoneTime.textContent = text;
        }
      };
      updatePhoneClock();
      setInterval(updatePhoneClock, 15000);
    }

    const phoneWifi = $("#phoneWifi");
    if (phoneWifi && !reduceMotion) {
      const levels = ["3", "2", "1", "2"];
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % levels.length;
        phoneWifi.setAttribute("data-wifi", levels[idx]);
      }, 5000);
    }
  }
})();
