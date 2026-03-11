export const FALLBACK_TEMPLATE = {
  id: "template-fundo-branco",
  name: "Template Clássico",
  src: "assets/templates/fundo-branco.png"
};

export function buildEditorModels() {
  return [
    {
      id: "moldura-1",
      name: "Moldura 1",
      src: "assets/molduras-de-foto/modelo-1/1.png",
      type: "moldura",
      slots: [
        { id: "foto1", x: 90,  y: 180, width: 1320, height: 1840, borderRadius: 0, type: "framed", border: false },
        { id: "foto2", x: 1590, y: 180, width: 1320, height: 1840, borderRadius: 0, type: "framed", border: false }
      ],
      textFields: []
    },
    {
      id: "moldura-2",
      name: "Moldura 2",
      src: "assets/molduras-de-foto/modelo-1/2.png",
      type: "moldura",
      slots: [
        { id: "foto1", x: 90, y: 180, width: 2820, height: 1840, borderRadius: 0, type: "framed", border: false }
      ],
      textFields: []
    },
    {
      id: "moldura-3",
      name: "Moldura 3",
      src: "assets/molduras-de-foto/modelo-1/3.png",
      type: "moldura",
      slots: [
        { id: "foto1", x: 90, y: 180, width: 2820, height: 1840, borderRadius: 0, type: "framed", border: false }
      ],
      textFields: []
    },
    {
      id: "moldura-4",
      name: "Moldura 4",
      src: "assets/molduras-de-foto/modelo-1/4.png",
      type: "moldura",
      slots: [
        { id: "foto1", x: 90, y: 180, width: 2820, height: 1840, borderRadius: 0, type: "framed", border: false }
      ],
      textFields: []
    }
  ];
}
