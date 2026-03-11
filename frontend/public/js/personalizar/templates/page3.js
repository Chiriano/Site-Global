(function () {
  'use strict';

  var shared = window.AlphaConvitesTemplateShared;
  var registry = window.AlphaConvitesPageTemplates = window.AlphaConvitesPageTemplates || {};
  var TEMPLATE_BG = '/assets/Molduras-convites/Cursos/MEDICINA/MEDICINA%20%E2%80%93%20UNIVERSIDADE%20DO%20PAR%C3%81/pag-3.png';

  function createPage3Template(api) {
    // Coordenadas medidas por pixel-scan do PNG (8092×6004):
    // Borda esq interna x=525, borda dir interna x=7696
    // Borda sup interna y=395, borda inf interna y=5613
    var contentRect = shared.rectFromRatios(api, {
      x: 0.064867,    // 525/8092
      y: 0.065790,    // 395/6004
      width: 0.886196, // (7696-525)/8092
      height: 0.869220 // (5613-395)/6004
    });

    shared.addTemplateBackground(api, api.page.data.templateBackground);

    shared.addPhotoSlot(api, {
      id: 'content-main',
      left: contentRect.left,
      top: contentRect.top,
      width: contentRect.width,
      height: contentRect.height,
      placeholder: 'ÁREA DE CONTEÚDO',
      slot: api.page.data.photoSlots['content-main']
    });
  }

  registry.page3 = {
    id: 'page3',
    label: 'Página 3',
    thumbLabel: 'Em preparação',
    createState: function () {
      return {
        templateBackground: {
          src: TEMPLATE_BG,
          element: null
        },
        selectedSlotId: 'content-main',
        photoSlots: {
          'content-main': {
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
    build: createPage3Template
  };
}());
