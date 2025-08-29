## Mini Ecommerce Mock API con Prism (OpenAPI)

Backend simulado centralizado para comparar apps móviles (Ionic, React Native, KMM) usando Prism a partir de `openapi.yaml`.

### 1) Contrato OpenAPI
- Archivo: `openapi.yaml`
- Servidor mock por defecto: `http://localhost:4010`
- Autenticación: Bearer Token (`Authorization: Bearer <token>`)
- Endpoints principales:
  - `POST /auth/login`
  - `GET /products`
  - `GET /products/{id}`
  - `GET /cart`, `POST /cart`
  - `POST /checkout`
  - `GET /orders`, `GET /orders/{id}`

Ejemplos rápidos (cURL):
```bash
# Login (obtiene token y userId)
curl -s -X POST http://localhost:4010/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"strong_password_123"}'

# Listar productos (con token)
curl -s http://localhost:4010/products \
  -H 'Authorization: Bearer mock-token-123'

# Detalle de producto
curl -s http://localhost:4010/products/prod-1 \
  -H 'Authorization: Bearer mock-token-123'

# Carrito (GET)
curl -s http://localhost:4010/cart \
  -H 'Authorization: Bearer mock-token-123'

# Carrito (POST)
curl -s -X POST http://localhost:4010/cart \
  -H 'Authorization: Bearer mock-token-123' \
  -H 'Content-Type: application/json' \
  -d '{"productId":"prod-1","quantity":2}'

# Checkout
curl -s -X POST http://localhost:4010/checkout \
  -H 'Authorization: Bearer mock-token-123' \
  -H 'Content-Type: application/json' \
  -d '{"paymentMethod":"card","cardLast4":"4242"}'

# Órdenes
curl -s http://localhost:4010/orders \
  -H 'Authorization: Bearer mock-token-123'
```

---

### 2) Instalación de Prism
Requisitos: Node.js 16+ (recomendado 18+)

- Opción A (npm global):
```bash
npm i -g @stoplight/prism-cli
prism --version
```

- Opción B (Homebrew en macOS):
```bash
brew install stoplight/tap/prism
prism --version
```

- Opción C (npx, sin instalar globalmente):
```bash
npx @stoplight/prism-cli --version
```

---

### 3) Ejecutar el servidor mock
Desde la carpeta del proyecto (`proof-mock`):
```bash
prism mock openapi.yaml --port 4010 --cors
```
- `--port`: cambia el puerto (por defecto 4010 en este README)
- `--cors`: habilita CORS para desarrollo
- `CTRL+C` para detener

Simular latencia con `--delay` (milisegundos):
```bash
# 0 ms (baseline)
prism mock openapi.yaml --port 4010 --cors --delay 0

# 500 ms (red 3G rápida simulada)
prism mock openapi.yaml --port 4010 --cors --delay 500

# 2000 ms (red lenta simulada)
prism mock openapi.yaml --port 4010 --cors --delay 2000
```

Opcionales útiles:
```bash
# Ver logs detallados
prism mock openapi.yaml --port 4010 --cors --log-level debug

# Forzar ejemplos estáticos del contrato (modo mock estricto)
prism mock openapi.yaml --port 4010 --cors --mock static
```

---

### 4) Configuración de apps cliente
Notas de red para emuladores/simuladores:
- iOS Simulator: `http://localhost:4010`
- Android Emulator: `http://10.0.2.2:4010`
- Dispositivo físico: usar la IP local de tu máquina (por ej. `http://192.168.1.100:4010`)

#### 4.1) Ionic (Angular)
- Define la base de API en `src/environments/environment.ts`:
```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:4010'
};
```
- Ejemplo de uso con `HttpClient`:
```ts
this.http.post(`${environment.apiBaseUrl}/auth/login`, {
  email: 'user@example.com',
  password: 'strong_password_123'
}).subscribe();
```
- Incluir header de autenticación tras login:
```ts
const headers = { Authorization: 'Bearer mock-token-123' };
this.http.get(`${environment.apiBaseUrl}/products`, { headers }).subscribe();
```

#### 4.2) React Native
- Instala Axios (opcional):
```bash
npm i axios
```
- Configura el `baseURL`:
```js
import axios from 'axios';
const api = axios.create({ baseURL: 'http://10.0.2.2:4010' }); // Android emu
// iOS Simulator: 'http://localhost:4010'

const login = () => api.post('/auth/login', {
  email: 'user@example.com',
  password: 'strong_password_123'
});

const listProducts = (token) => api.get('/products', {
  headers: { Authorization: `Bearer ${token}` }
});
```

#### 4.3) KMM (Kotlin Multiplatform con Ktor)
- Dependencias (gradle): `io.ktor:ktor-client-core`, `ktor-client-darwin` (iOS), `ktor-client-okhttp` (Android)
- Configuración básica:
```kotlin
val client = HttpClient(Default) {
    expectSuccess = false
}

suspend fun login(): HttpResponse = client.post("http://localhost:4010/auth/login") {
    contentType(ContentType.Application.Json)
    setBody(mapOf("email" to "user@example.com", "password" to "strong_password_123"))
}

suspend fun products(token: String): HttpResponse = client.get("http://localhost:4010/products") {
    header("Authorization", "Bearer $token")
}
```
- Para Android Emulator usa `http://10.0.2.2:4010`.

---

### 5) Escenarios de pruebas de rendimiento
- Baseline (sin latencia):
  - Ejecuta Prism con `--delay 0`.
  - Mide TTFB y duración total de peticiones clave: login, listar productos, detalle, carrito y checkout.
- Network simulation (latencias):
  - Ejecuta Prism con `--delay 500` y `--delay 2000`.
  - Opcional: usa Network Link Conditioner (iOS) o parámetros del Android Emulator (tab Network).
- Stress test del mock:
  - `npx autocannon http://localhost:4010/products -c 50 -d 30 -p 10`
  - Métricas: latencia p95/p99, throughput, error rate (4xx/5xx).

Recomendación: ejecutar 3 corridas por escenario y promediar; registrar hardware y versión de la app.

---

### 6) Buenas prácticas y consistencia
- Respuestas siguen esquemas: `Product`, `Cart`, `Order`, `AuthResponse`, etc.
- Utiliza header `Authorization: Bearer <token>` tras login.
- Manejo de errores: esquema `Error { code, message }`.
- IDs y ejemplos consistentes con `openapi.yaml`.

---

### 7) Beneficios de este enfoque
- Un único contrato fuente de verdad para las 3 apps.
- Iteración rápida: cambios en `openapi.yaml` actualizan el mock inmediatamente.
- Reproducibilidad de pruebas con `--delay` y escenarios definidos.
- Aislamiento del backend real; foco en UI/UX y rendimiento del cliente.

---

### 8) Solución de problemas
- CORS: asegúrate de correr Prism con `--cors`.
- Puerto ocupado: cambia `--port`.
- Emuladores: usa el host correcto (`10.0.2.2` en Android Emulator).
- Certificados/HTTPS: para desarrollo usa HTTP; para HTTPS local considera proxies (e.g., mkcert + reverse proxy).
