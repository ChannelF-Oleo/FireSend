# 🔥 FireSend (v2.0)

**SaaS PWA para Automatización de Instagram con IA**

FireSend es una plataforma diseñada bajo una arquitectura **Event-Driven Serverless** que permite automatizar conversaciones de Instagram, cualificar leads y sincronizar datos con herramientas externas como Notion. A diferencia de soluciones low-code, esta versión 2.0 corre sobre código nativo para maximizar la escalabilidad y el control.

## 🚀 Arquitectura del Sistema

El sistema no utiliza un servidor activo 24/7. En su lugar, utiliza funciones serverless que reaccionan a eventos, optimizando costos y recursos.

### Componentes Principales

1. 
**Frontend (PWA):** Panel de control desarrollado en React (Next.js) para dashboard, inbox manual y configuración.


2. 
**Ingestion Layer (Webhook):** Punto de entrada de alta velocidad encargado únicamente de recibir la petición de Meta y guardarla atómicamente.


3. **Processing Layer (Async Workers):** "El Cerebro". Gestiona la cola de mensajes, aplica lógica de *debounce* y conecta con la IA.


4. 
**Integration Module:** Módulos de Node.js a medida para integraciones externas (ej. Notion).



---

## 🛠 Tech Stack

* **Frontend:** React (Next.js)
* **Backend:** Node.js, Firebase Functions
* **Base de Datos:** Firebase Firestore, Firebase Auth
* 
**IA:** OpenAI API (GPT-4o-mini) 


* 
**Integraciones:** Meta Graph API, Notion API 



---

## 🔄 Flujo de Datos ("The Core Loop")

El corazón del sistema maneja la concurrencia y evita respuestas duplicadas a través de tres pasos:

1. **Ingesta (Webhook):**
* Valida la firma de seguridad (X-Hub-Signature).
* Guarda el mensaje en Firestore con estado `pending`.
* Retorna `200 OK` a Meta en < 200ms.




2. **Debounce & Agrupación:**
* Trigger: `firestore.onCreate`.
* Espera 3 segundos para agrupar mensajes consecutivos del mismo usuario.
* Verifica condiciones de carrera y concatena los mensajes en un solo bloque de contexto.




3. **Orquestación de IA:**
* Input: Historial + Mensaje Agrupado + System Prompt.
* 
**Tool Handling:** Si la IA lo requiere, ejecuta funciones locales (ej. `get_prices`) o externas (ej. `save_lead` en Notion).





---

## 📂 Modelo de Datos (Firestore Schema)

Diseñado para lecturas rápidas y escalabilidad por "tenant" (cliente del SaaS).

### `tenants/{tenant_id}`

Almacena la configuración del negocio.

```json
{
  "owner_uid": "firebase_auth_id",
  "instagram_page_id": "...",
  "system_prompt": "Eres un experto...",
  "integrations": {
    "notion": { "api_key": "...", "db_id": "..." }
  },
  "products_catalog": [
    { "id": "p1", "name": "Plan Web", "price": 500 }
  ]
}

```



### `conversations/{conversation_id}`

Gestiona el estado y memoria de cada chat.

```json
{
  "tenant_id": "tenant_123",
  "status": "active",
  "stage": "negotiation",
  "ai_memory_summary": "Resumen del contexto...",
  "collected_data": { "name": "Juan", "email": "..." }
}

```



---

## 🗺 Roadmap de Desarrollo

El proyecto sigue una estrategia de implementación progresiva:

* [ ] **Fase 1: El Loro (Echo Bot)**
* Configuración de Meta App y Webhooks.
* Objetivo: Validar conectividad (recibir mensaje -> responder "Echo").




* [ ] **Fase 2: El Cerebro (IA + Contexto)**
* Conexión con OpenAI y persistencia de historial en Firestore.
* Objetivo: Chat fluido con memoria.




* [ ] **Fase 3: Estabilidad (Debounce)**
* Implementación de lógica de espera (3s) y agrupación de mensajes.
* Objetivo: Manejo robusto de mensajes consecutivos.




* [ ] **Fase 4: Herramientas (Tools + Notion)**
* Configuración de *Function Calling* y módulo `notion_service.js`.
* Objetivo: Cerrar el ciclo de venta automatizado.





---

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/firesend.git
cd firesend

```


2. **Instalar dependencias:**
```bash
npm install
# O para el backend
cd functions && npm install

```


3. **Variables de Entorno:**
Configura tu `.env` con las credenciales necesarias:
```env
OPENAI_API_KEY=sk-...
META_ACCESS_TOKEN=...
FIREBASE_CONFIG=...
NOTION_KEY=...

```


4. **Deploy:**
```bash
firebase deploy --only functions

```



---

**FireSend** - *Automating interactions, scaling businesses.*

