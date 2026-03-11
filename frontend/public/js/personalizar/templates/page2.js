(function () {
  'use strict';

  var shared = window.AlphaConvitesTemplateShared;
  var registry = window.AlphaConvitesPageTemplates = window.AlphaConvitesPageTemplates || {};
  var TEMPLATE_BG = '/assets/Molduras-convites/Cursos/MEDICINA/MEDICINA%20%E2%80%93%20UNIVERSIDADE%20DO%20PAR%C3%81/pag-2.png';

  function createPage2Template(api) {
    // Coordenadas medidas por pixel-scan do PNG (8092×6004):
    // Bordas verticais: esq=525, div-esq=4056, div-dir=4165, dir=7696
    // Bordas horizontais: sup=395, div-inf=2949, div-sup=3058, inf=5613
    var sharedSlots = [
      {
        id: 'frame1',
        rect: shared.rectFromRatios(api, {
          x: 0.064867,    // 525/8092
          y: 0.065790,    // 395/6004
          width: 0.436370, // (4056-525)/8092
          height: 0.425383 // (2949-395)/6004
        }),
        placeholder: 'FOTO 1'
      },
      {
        id: 'frame2',
        rect: shared.rectFromRatios(api, {
          x: 0.514828,    // 4165/8092
          y: 0.065790,    // 395/6004
          width: 0.436370, // (7696-4165)/8092
          height: 0.425383 // (2949-395)/6004
        }),
        placeholder: 'FOTO 2'
      },
      {
        id: 'frame3',
        rect: shared.rectFromRatios(api, {
          x: 0.064867,    // 525/8092
          y: 0.509327,    // 3058/6004
          width: 0.436370, // (4056-525)/8092
          height: 0.425550 // (5613-3058)/6004
        }),
        placeholder: 'FOTO 3'
      },
      {
        id: 'frame4',
        rect: shared.rectFromRatios(api, {
          x: 0.514828,    // 4165/8092
          y: 0.509327,    // 3058/6004
          width: 0.436370, // (7696-4165)/8092
          height: 0.425550 // (5613-3058)/6004
        }),
        placeholder: 'FOTO 4'
      }
    ];

    shared.addTemplateBackground(api, api.page.data.templateBackground);

    sharedSlots.forEach(function (slotCfg) {
      shared.addPhotoSlot(api, {
        id: slotCfg.id,
        left: slotCfg.rect.left,
        top: slotCfg.rect.top,
        width: slotCfg.rect.width,
        height: slotCfg.rect.height,
        placeholder: slotCfg.placeholder,
        slot: api.page.data.photoSlots[slotCfg.id]
      });
    });
  }

  registry.page2 = {
    id: 'page2',
    label: 'Página 2',
    thumbLabel: 'Galeria',
    createState: function () {
      return {
        templateBackground: {
          src: TEMPLATE_BG,
          element: null
        },
        selectedSlotId: 'frame1',
        photoSlots: {
          frame1: { src: '', element: null, crop: { offsetX: 0, offsetY: 0, zoom: 1, isCropping: false } },
          frame2: { src: '', element: null, crop: { offsetX: 0, offsetY: 0, zoom: 1, isCropping: false } },
          frame3: { src: '', element: null, crop: { offsetX: 0, offsetY: 0, zoom: 1, isCropping: false } },
          frame4: { src: '', element: null, crop: { offsetX: 0, offsetY: 0, zoom: 1, isCropping: false } }
        }
      };
    },
    build: createPage2Template
  };
}());
