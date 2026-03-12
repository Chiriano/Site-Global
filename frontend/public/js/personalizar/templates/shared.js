(function () {
  'use strict';

  function add(canvas, object, bag, key) {
    canvas.add(object);
    if (bag && key) bag[key] = object;
    return object;
  }

  function rectFromRatios(api, ratios) {
    return {
      left: Math.round(api.size.width * ratios.x),
      top: Math.round(api.size.height * ratios.y),
      width: Math.round(api.size.width * ratios.width),
      height: Math.round(api.size.height * ratios.height),
      radius: ratios.radius || 0
    };
  }

  function createSlotClip(fabric, cfg) {
    return new fabric.Rect({
      left: cfg.left,
      top: cfg.top,
      width: cfg.width,
      height: cfg.height,
      absolutePositioned: true,
      rx: cfg.radius || 0,
      ry: cfg.radius || 0
    });
  }

  function getSlotBaseScale(slotElement, cfg) {
    return Math.max(cfg.width / slotElement.width, cfg.height / slotElement.height);
  }

  function clampSlotImage(image, cfg) {
    var width = image.width * image.scaleX;
    var height = image.height * image.scaleY;
    var minLeft = cfg.left + cfg.width - width;
    var minTop = cfg.top + cfg.height - height;
    var maxLeft = cfg.left;
    var maxTop = cfg.top;

    image.set({
      left: Math.min(maxLeft, Math.max(minLeft, image.left)),
      top: Math.min(maxTop, Math.max(minTop, image.top))
    });
  }

  function syncSlotCropFromImage(slot, image, cfg) {
    var zoom = slot.crop && slot.crop.zoom ? slot.crop.zoom : 1;
    var baseScale = getSlotBaseScale(image.getElement ? image.getElement() : image._element, cfg);
    var centeredLeft = cfg.left + (cfg.width - image.width * image.scaleX) / 2;
    var centeredTop = cfg.top + (cfg.height - image.height * image.scaleY) / 2;

    slot.crop = slot.crop || {};
    slot.crop.zoom = zoom;
    slot.crop.baseScale = baseScale;
    slot.crop.offsetX = image.left - centeredLeft;
    slot.crop.offsetY = image.top - centeredTop;
  }

  function addTemplateBackground(api, asset) {
    var fabric = api.fabric;
    var canvas = api.canvas;
    var refs = api.refs;
    var width = api.size.width;
    var height = api.size.height;

    if (asset && asset.element && asset.element.complete) {
      add(canvas, new fabric.Image(asset.element, {
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        scaleX: width / asset.element.width,
        scaleY: height / asset.element.height,
        name: 'template-background'
      }), refs, 'background');
      return;
    }

    add(canvas, new fabric.Rect({
      left: 0,
      top: 0,
      width: width,
      height: height,
      fill: '#f5f2ed',
      selectable: false,
      evented: false,
      name: 'template-background-fallback'
    }), refs, 'background');
  }

  function addPhotoSlot(api, cfg) {
    var fabric = api.fabric;
    var canvas = api.canvas;
    var refs = api.refs;
    var slot = cfg.slot;
    var slotCrop = slot.crop || {};
    var isSelected = api.selectedSlotId === cfg.id;
    var isCropping = !!slotCrop.isCropping;
    var frame = new fabric.Rect({
      left: cfg.left,
      top: cfg.top,
      width: cfg.width,
      height: cfg.height,
      fill: 'rgba(255,255,255,0.001)',
      stroke: 'transparent',
      strokeWidth: 0,
      selectable: false,
      evented: true,
      rx: cfg.radius || 0,
      ry: cfg.radius || 0,
      slotId: cfg.id,
      photoSlot: true,
      pageId: api.page.id,
      name: 'slot-' + cfg.id
    });

    refs.photoSlots = refs.photoSlots || {};
    refs.photoSlots[cfg.id] = refs.photoSlots[cfg.id] || {};
    refs.photoSlots[cfg.id].frame = frame;
    canvas.add(frame);

    if (slot.src) {
      var image = new fabric.Image(slot.element, {
        left: cfg.left,
        top: cfg.top,
        selectable: isCropping,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
        hoverCursor: isCropping ? 'move' : 'default',
        slotId: cfg.id,
        photoSlot: true,
        photoSlotImage: true,
        pageId: api.page.id,
        cropMode: isCropping,
        frameRect: {
          left: cfg.left,
          top: cfg.top,
          width: cfg.width,
          height: cfg.height
        },
        name: 'photo-' + cfg.id
      });
      var imgW = slot.element.naturalWidth  || slot.element.width  || image.width  || 1;
      var imgH = slot.element.naturalHeight || slot.element.height || image.height || 1;
      var baseScale = Math.max((cfg.width + 2) / imgW, (cfg.height + 2) / imgH);
      var scale = baseScale * (slotCrop.zoom || 1);
      var centeredLeft = cfg.left + (cfg.width  - imgW * scale) / 2;
      var centeredTop  = cfg.top  + (cfg.height - imgH * scale) / 2;
      image.set({
        scaleX: scale,
        scaleY: scale,
        left: centeredLeft + (slotCrop.offsetX || 0),
        top: centeredTop + (slotCrop.offsetY || 0),
        clipPath: createSlotClip(fabric, cfg)
      });
      clampSlotImage(image, cfg);
      syncSlotCropFromImage(slot, image, cfg);
      refs.photoSlots[cfg.id].image = image;
      canvas.add(image);
      return;
    }

    refs.photoSlots[cfg.id].placeholder = new fabric.Textbox(cfg.placeholder || 'SELECIONE UMA FOTO', {
      left: cfg.left + 22,
      top: cfg.top + cfg.height / 2 - 14,
      width: cfg.width - 44,
      fontSize: 14,
      fontFamily: 'Sora, sans-serif',
      fontWeight: '600',
      textAlign: 'center',
      fill: 'transparent',
      selectable: false,
      evented: true,
      slotId: cfg.id,
      photoSlot: true,
      pageId: api.page.id,
      name: 'placeholder-' + cfg.id
    });
    canvas.add(refs.photoSlots[cfg.id].placeholder);
  }

  function buildPhotoElement(src) {
    if (!src) return null;
    var image = new Image();
    image.src = src;
    return image;
  }

  window.AlphaConvitesTemplateShared = {
    add: add,
    rectFromRatios: rectFromRatios,
    addTemplateBackground: addTemplateBackground,
    addPhotoSlot: addPhotoSlot,
    buildPhotoElement: buildPhotoElement,
    clampSlotImage: clampSlotImage,
    syncSlotCropFromImage: syncSlotCropFromImage
  };
}());
