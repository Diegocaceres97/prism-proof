# Clean Architecture Implementation

## Estructura del Proyecto

El proyecto ha sido refactorizado siguiendo los principios de Clean Architecture con las siguientes capas:

### 📁 Capas de la Arquitectura

```
src/app/
├── 🎨 presentation/           # Presentation Layer (UI Views)
│   └── presenters/
│       └── home/
│           ├── home.page.html
│           ├── home.page.scss
│           ├── home.page.ts   # UI Component
│           └── home.presenter.ts # Business Logic Presenter
│
├── 🧠 domain/                 # Domain Layer (Business Logic)
│   ├── entities/              # Business Models
│   │   ├── user.entity.ts
│   │   ├── product.entity.ts
│   │   └── cart.entity.ts
│   ├── protocols/             # Repository Interfaces
│   │   ├── auth-repository.protocol.ts
│   │   └── product-repository.protocol.ts
│   └── use-cases/             # Use Cases (Business Rules)
│       ├── auth/
│       │   └── login.use-case.ts
│       └── products/
│           ├── get-products.use-case.ts
│           └── get-product-by-id.use-case.ts
│
└── 💾 data/                   # Data Layer (External Concerns)
    ├── gateway/               # Gateways & Interfaces
    │   ├── repositories/      # Repository Interfaces
    │   └── data-sources/      # Data Source Interfaces
    └── infrastructure/        # Infrastructure Implementations
        ├── http/              # HTTP Client Adapters
        └── repositories/      # Repository Implementations
```

### 🔄 Flujo de Dependencias

```
UI (Page) → Presenter → Use Case → Repository Protocol → Repository Impl → HTTP Adapter
```

### 📋 Principios Aplicados

1. **Dependency Inversion**: Las capas internas no conocen las externas
2. **Single Responsibility**: Cada clase tiene una única responsabilidad
3. **Interface Segregation**: Interfaces específicas para cada necesidad
4. **Separation of Concerns**: UI, lógica de negocio y datos separados

### 🚀 Beneficios

- ✅ **Testeable**: Cada capa se puede testear independientemente
- ✅ **Mantenible**: Cambios en una capa no afectan otras
- ✅ **Escalable**: Fácil agregar nuevas funcionalidades
- ✅ **Framework Independent**: Lógica de negocio independiente de Angular/Ionic

### 🛠️ Configuración DI (Dependency Injection)

En `main.ts` se configuran los providers para la inyección de dependencias:

```typescript
// Clean Architecture DI
{ provide: HttpClientInterface, useClass: AngularHttpClientAdapter },
{ provide: AuthRepositoryProtocol, useClass: AuthRepositoryImpl },
{ provide: ProductRepositoryProtocol, useClass: ProductRepositoryImpl },
```

### 📝 Ejemplo de Uso

```typescript
// En el presenter
constructor() {
  private loginUseCase = inject(LoginUseCase);
}

async login() {
  const result = await this.loginUseCase.execute(credentials);
}
```

### 🧪 Testing Strategy

- **Unit Tests**: Cada use case, presenter y repository por separado
- **Integration Tests**: Flujo completo con mocks
- **E2E Tests**: Pruebas de interfaz de usuario

### 🔧 Próximos Pasos

1. Agregar más casos de uso (Cart, Orders)
2. Implementar manejo de tokens con interceptors
3. Agregar tests unitarios
4. Configurar estado global con signals
