import { ApplicationConfig,importProvidersFrom , APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // For Angular Material animations
import { provideHttpClient } from '@angular/common/http'; // Import HttpClient for fetching config

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Your application routes
import { ConfigService } from './services/app-config.service'; // Import your new ConfigService

// Function to initialize the config service
function initializeAppConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Provides routing capabilities
    provideAnimations(), provideAnimationsAsync(),   // Provides browser animations for Angular Material
    provideHttpClient(), // Provide HttpClient for use in services and components
    ConfigService, // Make ConfigService injectable
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [ConfigService], // Inject ConfigService into the factory function
      multi: true // Essential for APP_INITIALIZER as there can be multiple initializers
    }
  ]
};
