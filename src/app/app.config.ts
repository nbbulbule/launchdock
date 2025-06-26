import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // For Angular Material animations

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Your application routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Provides routing capabilities
    provideAnimations(), provideAnimationsAsync(),   // Provides browser animations for Angular Material
  ]
};
