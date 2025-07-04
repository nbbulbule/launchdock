import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives
import { MatTabsModule } from '@angular/material/tabs'; // For Angular Material tabs
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigService } from '../services/app-config.service';
@Component({
  selector: 'app-google-service',
  standalone: true, // Mark component as standalone
  imports: [
    CommonModule, // Required for common directives
    MatTabsModule, // Required for MatTabGroup and MatTab
  ],
  templateUrl: './google-service.component.html',
  styleUrls: ['./google-service.component.css'],
})
export class GoogleServiceComponent implements OnInit {
  constructor(
    private sanitizer: DomSanitizer,
    private configService: ConfigService
  ) {} // Inject DomSanitizer

  // This is your problematic URL with special characters
  googleCalendarURL: SafeResourceUrl | undefined; // Declare a property to hold the safe URL

  ngOnInit(): void {
    const config = this.configService.getConfig();
    if (config && config.googleCalendarURL) {
      // Crucially, use bypassSecurityTrustResourceUrl to mark the URL as safe
      this.googleCalendarURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        config.googleCalendarURL
      );
      console.log('config file details ', config);
    } else {
      console.warn(
        'appName and tagline not found in configuration. Using fallback.'
      );
      // Fallback if config isn't loaded or URL is missing
      this.googleCalendarURL = '';
    }
  }
}
