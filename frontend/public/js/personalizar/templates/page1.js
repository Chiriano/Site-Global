(function () {
  'use strict';

  var shared = window.AlphaConvitesTemplateShared;
  var registry = window.AlphaConvitesPageTemplates = window.AlphaConvitesPageTemplates || {};
  var TEMPLATE_BG = '/assets/Molduras-convites/Cursos/MEDICINA/MEDICINA%20%E2%80%93%20UNIVERSIDADE%20DO%20PAR%C3%81/pag-1.png';

  function createPage1Template(api) {
    var fabric = api.fabric;
    var canvas = api.canvas;
    var page = api.page;
    var state = page.data;
    var refs = api.refs;
    // Coordenadas medidas por pixel-scan do PNG (8092×6004):
    // Borda esq interna x=4110, borda dir interna x=7701
    // Borda sup interna y=390, borda inf interna y=5618
    var photoRect = shared.rectFromRatios(api, {
      x: 0.508034,    // 4110/8092
      y: 0.064957,    // 390/6004
      width: 0.443648, // (7701-4110)/8092
      height: 0.870553 // (5618-390)/6004
    });
    var layout = {
      title:    { left: 120, top: 88,  width: 420, height: 88 },
      subtitle: { left: 120, top: 176, width: 430, height: 56 },
      parents:  { left: 120, top: 244, width: 418, height: 70 },
      body:     { left: 120, top: 326, width: 418, height: 508 },
      photo: photoRect
    };

    var fittedTitle = api.fitTextToBox({
      text: state.title,
      width: layout.title.width,
      height: layout.title.height,
      maxFontSize: api.clamp(state.titleFontSize, 12, 60),
      minFontSize: 12,
      lineHeight: 1.2,
      fontFamily: '"Great Vibes", Georgia, serif',
      fontWeight: '400'
    });

    var fittedParents = api.fitTextToBox({
      text: state.parents,
      width: layout.parents.width,
      height: layout.parents.height,
      maxFontSize: api.clamp(state.parentsFontSize, 12, 30),
      minFontSize: 12,
      lineHeight: 1.2,
      fontFamily: 'Georgia, serif',
      fontWeight: '400'
    });

    var fittedBody = api.fitTextToBox({
      text: state.body,
      width: layout.body.width,
      height: layout.body.height,
      maxFontSize: api.clamp(state.bodyFontSize, 12, 45),
      minFontSize: 12,
      lineHeight: 1.2,
      fontFamily: 'Georgia, serif',
      fontWeight: '400'
    });

    shared.addTemplateBackground(api, state.templateBackground);

    shared.add(canvas, new fabric.Textbox(fittedTitle.text || 'Nome Destaque', {
      left: layout.title.left,
      top: layout.title.top,
      width: layout.title.width,
      fontSize: fittedTitle.fontSize,
      fontFamily: '"Great Vibes", Georgia, serif',
      fill: '#a97924',
      textAlign: 'left',
      editable: true,
      selectable: true,
      splitByGrapheme: true,
      hasControls: false,
      hasBorders: true,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'text',
      dataKey: 'title',
      pageId: 'page1',
      name: 'page1-title'
    }), refs, 'title');

    refs.title.clipPath = new fabric.Rect({
      left: layout.title.left,
      top: layout.title.top,
      width: layout.title.width,
      height: layout.title.height,
      absolutePositioned: true
    });

    shared.add(canvas, new fabric.Textbox(state.subtitle || 'Curso · Data de Formatura', {
      left: layout.subtitle.left,
      top: layout.subtitle.top,
      width: layout.subtitle.width,
      fontSize: 18,
      fontFamily: 'Georgia, serif',
      fontWeight: '700',
      fill: '#d1be89',
      textAlign: 'left',
      editable: true,
      selectable: true,
      splitByGrapheme: true,
      hasControls: false,
      hasBorders: true,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'text',
      dataKey: 'subtitle',
      pageId: 'page1',
      name: 'page1-subtitle'
    }), refs, 'subtitle');

    refs.subtitle.clipPath = new fabric.Rect({
      left: layout.subtitle.left,
      top: layout.subtitle.top,
      width: layout.subtitle.width,
      height: layout.subtitle.height,
      absolutePositioned: true
    });

    // ---- Bloco dos pais ----
    shared.add(canvas, new fabric.Textbox(fittedParents.text || 'Nome do Pai\nNome da Mãe', {
      left: layout.parents.left,
      top: layout.parents.top,
      width: layout.parents.width,
      fontSize: fittedParents.fontSize,
      lineHeight: 1.2,
      fontFamily: 'Georgia, serif',
      fontWeight: '400',
      fill: '#2f2a26',
      textAlign: 'left',
      editable: true,
      selectable: true,
      splitByGrapheme: true,
      hasControls: false,
      hasBorders: true,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'text',
      dataKey: 'parents',
      pageId: 'page1',
      name: 'page1-parents'
    }), refs, 'parents');

    refs.parents.clipPath = new fabric.Rect({
      left: layout.parents.left,
      top: layout.parents.top,
      width: layout.parents.width,
      height: layout.parents.height,
      absolutePositioned: true
    });

    // ---- Mensagem principal ----
    shared.add(canvas, new fabric.Textbox(fittedBody.text, {
      left: layout.body.left,
      top: layout.body.top,
      width: layout.body.width,
      fontSize: fittedBody.fontSize,
      lineHeight: 1.2,
      fontFamily: 'Georgia, serif',
      fill: '#2f2a26',
      textAlign: 'left',
      editable: true,
      selectable: true,
      splitByGrapheme: true,
      lockScalingX: true,
      lockScalingY: true,
      hasControls: false,
      hasBorders: true,
      lockMovementX: true,
      lockMovementY: true,
      hoverCursor: 'text',
      dataKey: 'body',
      pageId: 'page1',
      name: 'page1-body'
    }), refs, 'body');

    refs.body.clipPath = new fabric.Rect({
      left: layout.body.left,
      top: layout.body.top,
      width: layout.body.width,
      height: layout.body.height,
      absolutePositioned: true
    });

    refs.body.bounds = {
      width: layout.body.width,
      height: layout.body.height
    };

    shared.addPhotoSlot(api, {
      id: 'main-photo',
      left: layout.photo.left,
      top: layout.photo.top,
      width: layout.photo.width,
      height: layout.photo.height,
      placeholder: 'INSIRA AQUI SUA FOTO PRINCIPAL',
      slot: state.photoSlots['main-photo']
    });
  }

  registry.page1 = {
    id: 'page1',
    label: 'Página 1',
    thumbLabel: 'Texto + Foto',
    createState: function () {
      return {
        templateBackground: {
          src: TEMPLATE_BG,
          element: null
        },
        title: 'Nome Destaque',
        subtitle: 'Curso · Data de Formatura',
        parents: 'Nome do Pai\nNome da Mãe',
        body: 'Escreva aqui a mensagem principal do convite. Este bloco foi preparado para textos mais longos, mantendo o layout fixo e organizado dentro da página.',
        titleFontSize: 45,
        parentsFontSize: 18,
        bodyFontSize: 45,
        selectedSlotId: 'main-photo',
        photoSlots: {
          'main-photo': {
            src: '',
            element: null,
            crop: {
              offsetX: 0,
              offsetY: 0,
              zoom: 1,
              isCropping: false
            }
          }
        }
      };
    },
    build: createPage1Template
  };
}());
