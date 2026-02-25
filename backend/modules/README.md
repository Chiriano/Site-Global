# Web-to-Print Modules (Backend)

Implementacao modular sem alterar o design do frontend publico.

## Estrutura

- `editor/`: sessao de arte, templates e exportacao tecnica.
- `upload/`: upload com validacao de formato e resolucao para impressao.
- `pdf-engine/`: geracao de PDF de producao (CMYK, 300 DPI, sangria, metadados).
- `order-system/`: pedidos Web-to-Print com status e historico.
- `admin-panel/`: endpoints administrativos (dashboard, fila, financeiro, status).
- `common/`: utilitarios compartilhados (storage, ids, validacao, bootstrap).

## Rotas

Base: `/api/modules`

### Editor

- `GET /editor/templates`
- `POST /editor/sessions`
- `GET /editor/sessions/:sessionId`
- `PUT /editor/sessions/:sessionId`
- `POST /editor/sessions/:sessionId/export`

### Upload

- `POST /upload/file` (`multipart/form-data`, campo `file`)
- `GET /upload/files/:fileId`

### PDF Engine

- `POST /pdf-engine/production-pdf`
- `GET /pdf-engine/production-pdf/:pdfId`

### Order System

- `POST /order-system/orders`
- `GET /order-system/orders/:orderCode`
- `GET /order-system/orders/customer/:customerId`

### Admin Panel (protegido por JWT admin)

Base protegida: `/api/modules/admin-panel`

- `GET /dashboard`
- `GET /print-queue`
- `GET /finance`
- `GET /templates`
- `PATCH /orders/:orderCode/status`
- `POST /orders/:orderCode/assets`
