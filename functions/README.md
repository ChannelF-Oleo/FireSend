# FireSend Functions - Backend Serverless

Este directorio contiene las Cloud Functions de Firebase que implementan el core lógico de FireSend.

## 📁 Estructura

```
functions/
├── src/
│   ├── controllers/
│   │   └── webhookController.ts    # Webhook de Meta (ingesta)
│   ├── services/
│   │   ├── openai.ts               # Integración con OpenAI API
│   │   └── instagram.ts            # Integración con Meta Graph API
│   ├── utils/
│   │   └── security.ts             # Validación de firma HMAC
│   ├── workers/
│   │   └── messageProcessor.ts     # Worker con debounce + IA
│   └── index.ts                    # Exportaciones principales
├── .env.example                    # Template de variables de entorno
└── package.json
```

## 🚀 Funciones Desplegadas

### 1. `webhookHandler` (HTTP)

**Endpoint:** `/webhookHandler`  
**Método:** GET (verificación), POST (ingesta)

**Responsabilidades:**

- Verificar webhook de Meta (GET con hub.challenge)
- Validar firma HMAC SHA-256 (seguridad)
- Guardar mensajes entrantes en Firestore
- Responder a Meta en <200ms

**Variables de entorno requeridas:**

- `META_VERIFY_TOKEN`: Token de verificación del webhook
- `META_APP_SECRET`: Secret de la app de Meta (para validar firma)

### 2. `messageProcessor` (Firestore Trigger)

**Trigger:** `onCreate` en `conversations/{id}/messages/{msgId}`

**Responsabilidades:**

- Debounce de 3 segundos (evitar respuestas duplicadas)
- Recuperar historial de conversación
- Llamar a OpenAI con contexto
- Enviar respuesta a Instagram
- Actualizar Firestore con respuesta del bot

**Variables de entorno requeridas:**

- `OPENAI_API_KEY`: (opcional, puede venir del tenant)

## 🔧 Configuración

### 1. Instalar dependencias

```bash
cd functions
npm install
```

### 2. Configurar variables de entorno

**Para desarrollo local:**

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

**Para producción (Firebase):**

```bash
firebase functions:secrets:set META_APP_SECRET
firebase functions:secrets:set OPENAI_API_KEY
```

O usando variables de entorno normales:

```bash
firebase functions:config:set meta.verify_token="tu_token"
firebase functions:config:set meta.app_secret="tu_secret"
```

### 3. Compilar TypeScript

```bash
npm run build
```

### 4. Probar localmente (Emuladores)

```bash
npm run serve
```

### 5. Desplegar a producción

```bash
npm run deploy
```

## 🔐 Seguridad

### Validación de Firma de Meta

El webhook valida la firma `X-Hub-Signature-256` usando HMAC SHA-256:

```typescript
const signature = req.headers["x-hub-signature-256"];
const isValid = verifyMetaSignature(rawBody, signature, appSecret);
```

**Importante:** Si `META_APP_SECRET` no está configurado, la validación se salta (solo para desarrollo).

### Variables de Entorno Sensibles

- Nunca commitear `.env` al repositorio
- Usar Firebase Secret Manager para producción
- Rotar credenciales periódicamente

## 🧪 Testing

### Probar Webhook (GET - Verificación)

```bash
curl "http://localhost:5001/PROJECT_ID/us-central1/webhookHandler?hub.mode=subscribe&hub.verify_token=tu_token&hub.challenge=test123"
```

### Probar Webhook (POST - Mensaje)

```bash
curl -X POST http://localhost:5001/PROJECT_ID/us-central1/webhookHandler \
  -H "Content-Type: application/json" \
  -d '{
    "object": "instagram",
    "entry": [{
      "messaging": [{
        "sender": {"id": "123"},
        "recipient": {"id": "456"},
        "message": {"text": "Hola"}
      }]
    }]
  }'
```

## 📊 Flujo de Datos

```
1. Instagram → Webhook (POST)
   ↓
2. Validar firma HMAC
   ↓
3. Guardar en Firestore (status: pending)
   ↓
4. Trigger: onCreate → messageProcessor
   ↓
5. Debounce 3s (esperar más mensajes)
   ↓
6. Verificar si es el último mensaje
   ↓
7. Recuperar historial + config tenant
   ↓
8. Llamar OpenAI API
   ↓
9. Enviar respuesta a Instagram
   ↓
10. Guardar respuesta en Firestore (type: assistant)
```

## 🐛 Debugging

### Ver logs en tiempo real

```bash
firebase functions:log --only messageProcessor
```

### Ver logs en Firebase Console

https://console.firebase.google.com/project/YOUR_PROJECT/functions/logs

### Errores comunes

**Error: "OpenAI API Key no configurada"**

- Solución: Configurar `OPENAI_API_KEY` en env o en tenant

**Error: "Firma de Meta inválida"**

- Solución: Verificar que `META_APP_SECRET` coincida con Meta App Dashboard

**Error: "Instagram Access Token no configurado"**

- Solución: Configurar token en `/tenants/{id}` en Firestore

## 📝 Modelo de Datos

### Colección: `conversations`

```typescript
{
  tenant_id: string,
  instagram_user_id: string,
  instagram_username: string,
  page_id: string,
  last_message: string,
  last_message_at: Timestamp,
  stage: "active" | "negotiation" | "closed",
  unread_count: number
}
```

### Subcolección: `conversations/{id}/messages`

```typescript
{
  text: string,
  sender_id: string,
  recipient_id: string,
  timestamp: Timestamp,
  status: "pending" | "processed" | "sent" | "failed",
  type: "user" | "assistant",
  instagram_message_id?: string
}
```

### Colección: `tenants`

```typescript
{
  openaiKey: string,
  instagramToken: string,
  instagramPageId: string,
  systemPrompt: string
}
```

## 🚀 Próximos Pasos

- [ ] Implementar Function Calling (tools) para OpenAI
- [ ] Agregar integración con Notion
- [ ] Implementar rate limiting
- [ ] Agregar tests unitarios
- [ ] Configurar CI/CD
- [ ] Implementar retry logic para fallos de API
- [ ] Agregar métricas y monitoring

## 📚 Referencias

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Meta Webhooks](https://developers.facebook.com/docs/messenger-platform/webhooks)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
