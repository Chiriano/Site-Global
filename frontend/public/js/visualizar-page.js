(function () {
  const productConfigs = window.productConfigs || {};
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id") || "0", 10);
  const productConfig = productConfigs[productId];

  const editStorageKey = `alpha_personalizacao_${productId}`;
  const finalFlagKey = `alpha_personalizacao_finalizada_${productId}`;
  const finalPngKey = `alpha_personalizacao_png_${productId}`;

  const dom = {
    btnClose: document.getElementById("btn-close"),
    termsCheck: document.getElementById("terms-check"),
    btnFinalizar: document.getElementById("btn-finalizar"),
    canvas: document.getElementById("visualizar-canvas")
  };

  const ctx = dom.canvas.getContext("2d");

  if (!productConfig || !productConfig.personalizacao) {
    window.location.href = `personalizar.html?id=${encodeURIComponent(productId)}`;
    return;
  }

  const personalization = productConfig.personalizacao;
  const print = personalization.print || {
    canvas: { w: 2200, h: 3000 },
    safeArea: { x: 50, y: 50, w: 2100, h: 2900 }
  };

  const saved = loadSaved();
  if (!saved || !saved.layoutId) {
    alert("Nenhuma personalizacao salva para visualizar.");
    window.location.href = `personalizar.html?id=${encodeURIComponent(productId)}`;
    return;
  }

  const state = {
    layout: personalization.layouts.find(function (l) { return l.id === saved.layoutId; }) || personalization.layouts[0],
    photos: saved.photos || {},
    texts: saved.texts || {},
    imageCache: {},
    paperCache: {}
  };

  dom.btnClose.addEventListener("click", function () {
    window.location.href = `personalizar.html?id=${encodeURIComponent(productId)}`;
  });

  dom.termsCheck.addEventListener("change", function () {
    dom.btnFinalizar.disabled = !dom.termsCheck.checked;
  });

  dom.btnFinalizar.addEventListener("click", function () {
    renderCanvas();
    const png = dom.canvas.toDataURL("image/png");
    localStorage.setItem(finalFlagKey, "1");
    localStorage.setItem(finalPngKey, png);
    alert("Personalizacao confirmada!");
    window.location.href = `convite-product.html?id=${encodeURIComponent(productId)}&custom=1`;
  });

  loadImages().finally(function () {
    renderCanvas();
  });

  function loadSaved() {
    try {
      const raw = localStorage.getItem(editStorageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function loadImages() {
    const jobs = Object.keys(state.photos).map(function (key) {
      return loadImage(state.photos[key]).then(function (img) {
        state.imageCache[key] = img;
      }).catch(function () {
        delete state.imageCache[key];
      });
    });

    return Promise.all(jobs);
  }

  function renderCanvas() {
    const layout = state.layout;
    const canvasSize = layout.canvas || print.canvas;

    if (dom.canvas.width !== canvasSize.w || dom.canvas.height !== canvasSize.h) {
      dom.canvas.width = canvasSize.w;
      dom.canvas.height = canvasSize.h;
    }

    drawBackgroundPaper(ctx, dom.canvas.width, dom.canvas.height);

    (layout.photos || []).forEach(function (frame) {
      const image = state.imageCache[frame.key];
      if (image) {
        drawImageInFrame(ctx, image, frame);
      } else {
        drawEmptyFrame(ctx, frame);
      }
    });

    (layout.texts || []).forEach(function (txt) {
      const value = state.texts[txt.key] || "";
      if (!value) {
        return;
      }

      ctx.fillStyle = txt.color || "#4d3f2d";
      ctx.font = txt.font || "56px serif";
      ctx.textAlign = txt.align || "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(value.slice(0, 120), txt.x, txt.y, txt.maxW || 1600);
    });
  }

  function drawImageInFrame(ctx2, image, frame) {
    const radius = Number(frame.radius || 0);

    ctx2.save();
    roundedRectPath(ctx2, frame.x, frame.y, frame.w, frame.h, radius);
    ctx2.clip();
    drawImageCover(ctx2, image, frame.x, frame.y, frame.w, frame.h);
    ctx2.restore();

    drawFrameBorder(ctx2, frame);
  }

  function drawEmptyFrame(ctx2, frame) {
    ctx2.save();
    ctx2.shadowColor = "rgba(84, 61, 24, 0.14)";
    ctx2.shadowBlur = 14;
    ctx2.shadowOffsetY = 4;

    roundedRectPath(ctx2, frame.x, frame.y, frame.w, frame.h, frame.radius || 0);
    ctx2.fillStyle = "rgba(251, 246, 235, 0.86)";
    ctx2.fill();
    ctx2.restore();

    drawFrameBorder(ctx2, frame);
  }

  function drawFrameBorder(ctx2, frame) {
    ctx2.save();
    roundedRectPath(ctx2, frame.x, frame.y, frame.w, frame.h, frame.radius || 0);
    ctx2.strokeStyle = "#d9c28a";
    ctx2.lineWidth = 5;
    ctx2.stroke();
    ctx2.restore();
  }

  function drawBackgroundPaper(ctx2, w, h) {
    const cacheKey = `${w}x${h}`;
    if (!state.paperCache[cacheKey]) {
      const cacheCanvas = document.createElement("canvas");
      cacheCanvas.width = w;
      cacheCanvas.height = h;
      const c = cacheCanvas.getContext("2d");

      const base = c.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, "#f9f1de");
      base.addColorStop(1, "#ead7b6");
      c.fillStyle = base;
      c.fillRect(0, 0, w, h);

      const radial = c.createRadialGradient(w * 0.5, h * 0.42, 80, w * 0.5, h * 0.42, h * 0.8);
      radial.addColorStop(0, "rgba(255,255,248,0.8)");
      radial.addColorStop(1, "rgba(205,178,132,0)");
      c.fillStyle = radial;
      c.fillRect(0, 0, w, h);

      const vignette = c.createRadialGradient(w * 0.5, h * 0.5, h * 0.18, w * 0.5, h * 0.5, h * 0.78);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(84,58,21,0.24)");
      c.fillStyle = vignette;
      c.fillRect(0, 0, w, h);

      const noise = c.createImageData(w, h);
      for (let i = 0; i < noise.data.length; i += 4) {
        const n = 232 + Math.floor(Math.random() * 14);
        noise.data[i] = n;
        noise.data[i + 1] = n - 5;
        noise.data[i + 2] = n - 14;
        noise.data[i + 3] = 12;
      }
      c.putImageData(noise, 0, 0);

      state.paperCache[cacheKey] = cacheCanvas;
    }

    ctx2.clearRect(0, 0, w, h);
    ctx2.drawImage(state.paperCache[cacheKey], 0, 0);
  }

  function drawImageCover(ctx2, image, x, y, w, h) {
    const boxRatio = w / h;
    const imageRatio = image.width / image.height;
    let sx;
    let sy;
    let sw;
    let sh;

    if (imageRatio > boxRatio) {
      sh = image.height;
      sw = sh * boxRatio;
      sx = (image.width - sw) / 2;
      sy = 0;
    } else {
      sw = image.width;
      sh = sw / boxRatio;
      sx = 0;
      sy = (image.height - sh) / 2;
    }

    ctx2.drawImage(image, sx, sy, sw, sh, x, y, w, h);
  }

  function roundedRectPath(ctx2, x, y, w, h, radius) {
    const r = Math.max(0, Math.min(radius || 0, Math.min(w, h) / 2));
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.lineTo(x + w - r, y);
    ctx2.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx2.lineTo(x + w, y + h - r);
    ctx2.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx2.lineTo(x + r, y + h);
    ctx2.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx2.lineTo(x, y + r);
    ctx2.quadraticCurveTo(x, y, x + r, y);
    ctx2.closePath();
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("Erro ao carregar imagem.")); };
      image.src = src;
    });
  }
})();
