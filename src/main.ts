import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Clean Architecture providers
import { AUTH_REPOSITORY_TOKEN, PRODUCT_REPOSITORY_TOKEN } from './app/domain/protocols/tokens';
import { HTTP_CLIENT_TOKEN } from './app/data/gateway/data-sources/tokens';
import { AuthRepositoryImpl, ProductRepositoryImpl, AngularHttpClientAdapter } from './app/data';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptorsFromDi()),

    // Clean Architecture DI
    { provide: HTTP_CLIENT_TOKEN, useClass: AngularHttpClientAdapter },
    { provide: AUTH_REPOSITORY_TOKEN, useClass: AuthRepositoryImpl },
    { provide: PRODUCT_REPOSITORY_TOKEN, useClass: ProductRepositoryImpl },
  ],
});
