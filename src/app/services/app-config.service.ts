import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs'; // For Promise-based loading

// Define an interface for your configuration structure
export interface AppConfig {  
  appName?: string;
  tagline?: string;
  googleCalendarURL?: string;
  exportFileName?: string;
  // Add other properties defined in app-settings.json here
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;
  private configUrl = 'assets/appsettings.json'; // Path to your config file

  constructor(private http: HttpClient) { }

  /**
   * Loads the application configuration from app-settings.json.
   * This method is designed to be called once at application startup.
   * @returns A Promise that resolves when the config is loaded.
   */
  loadConfig(): Promise<void> {
    return firstValueFrom(this.http.get<AppConfig>(this.configUrl))
      .then(data => {
        this.config = data; // Store the loaded configuration
        console.log('App configuration loaded:', this.config);
      })
      .catch(error => {
        console.error('Failed to load app configuration:', error);
        // Handle error gracefully, e.g., set default values or show a message
        this.config = {          
          appName: 'App Name',
          tagline: 'Tagline',
          googleCalendarURL: '',
          exportFileName:"launchdock-data"
        };
        // Re-throw or return rejected promise if fatal
        throw error;
      });
  }

  /**
   * Gets a specific configuration property.
   * Ensure config is loaded before calling this in components.
   * @param key The key of the configuration property.
   * @returns The value of the property or undefined if not found.
   */
  get(key: keyof AppConfig): string | undefined {
    return this.config?.[key];
  }

  /**
   * Gets the entire configuration object.
   * @returns The AppConfig object or null if not yet loaded.
   */
  getConfig(): AppConfig | null {
    return this.config;
  }
}
