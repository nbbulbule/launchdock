import { Routes } from '@angular/router';
import { AppComponent } from './app.component'; // Your main component

export const routes: Routes = [
  // Define a default route to your AppComponent (which contains the main layout)
  { path: '', component: AppComponent },
  // Add other routes here if your application grows to have multiple "pages"
  // Example: { path: 'settings', component: SettingsPageComponent },
  // { path: '**', redirectTo: '' } // Wildcard route for any unmatched paths
];
