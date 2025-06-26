import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common'; // For *ngIf

// Import standalone components used in this template
import { ShortTabComponent } from './short-tab/short-tab.component';
import { MyListComponent } from './my-list/my-list.component';
import { GoogleServiceComponent } from './google-service/google-service.component';

// Define local storage keys
const SHORT_TAB_STORAGE_KEY = 'tabData-dev';
const MY_LIST_STORAGE_KEY = 'myListData';

@Component({
  selector: 'app-root',
  standalone: true, // Mark component as standalone
  imports: [
    CommonModule, // Required for common directives like *ngIf
    LayoutModule, // Required for BreakpointObserver
    ShortTabComponent, // Import your standalone short-tab component
    MyListComponent,   // Import your standalone my-list component
    GoogleServiceComponent // Import your standalone google-service component
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'LΛUNCH DØCK';
  tagline = 'A launching point for tools, apps, or sites from one centralized location';

  showSettingsMenu = false;
  isMobile = false; // Flag to determine mobile layout
  backgroundColorEnabled = true; // For toggling background

  private destroy$ = new Subject<void>(); // Used to unsubscribe from observables on component destruction

  constructor(private renderer: Renderer2, private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    // Set initial background state
    this.toggleBackgroundColor();

    // Observe screen size changes for responsive layout
    this.breakpointObserver.observe([
      Breakpoints.HandsetPortrait,
      Breakpoints.Small,
      Breakpoints.TabletPortrait,
      Breakpoints.WebPortrait // Added for portrait desktop breakpoints
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // Set isMobile to true if any of the handset or small breakpoints match
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emit a signal to complete all subscriptions
    this.destroy$.complete(); // Complete the subject
  }

  toggleSettingsMenu() {
    this.showSettingsMenu = !this.showSettingsMenu;
  }

  // Toggles between two background gradients for the body
  toggleBackgroundColor() {
    const body = document.body;
    if (body.classList.contains('body-background-gradient-a')) {
      body.classList.remove('body-background-gradient-a');
      body.classList.add('body-background-gradient-b');
    } else {
      body.classList.remove('body-background-gradient-b');
      body.classList.add('body-background-gradient-a');
    }
  }

  /**
   * Exports all application data from local storage (tabs and my list) into a single JSON file.
   */
  exportAllDataToJsonFile(): void {
    const allData = {
      [SHORT_TAB_STORAGE_KEY]: localStorage.getItem(SHORT_TAB_STORAGE_KEY) ? JSON.parse(localStorage.getItem(SHORT_TAB_STORAGE_KEY)!) : [],
      [MY_LIST_STORAGE_KEY]: localStorage.getItem(MY_LIST_STORAGE_KEY) ? JSON.parse(localStorage.getItem(MY_LIST_STORAGE_KEY)!) : []
    };

    const data = JSON.stringify(allData, null, 2);

    // Create formatted timestamp: ddMMyyyyHHmmss
    const now = new Date();
    const timestamp = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    // Create filename
    const fileName = `launchdock-data-${timestamp}.json`;

    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    window.URL.revokeObjectURL(url);
    alert('All application data exported successfully!');
  }

  /**
   * Imports application data from a JSON file and restores it to local storage.
   * Handles both tab data and my list data.
   * @param event The file input change event.
   */
  importAllDataFromJsonFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const importedData = JSON.parse(reader.result as string);

        if (typeof importedData === 'object' && importedData !== null) {
          // Check for tab data
          if (importedData[SHORT_TAB_STORAGE_KEY] && Array.isArray(importedData[SHORT_TAB_STORAGE_KEY])) {
            localStorage.setItem(SHORT_TAB_STORAGE_KEY, JSON.stringify(importedData[SHORT_TAB_STORAGE_KEY]));
            console.log('Tab data imported successfully.');
          } else {
            console.warn('No valid tab data found in the import file.');
          }

          // Check for my list data
          if (importedData[MY_LIST_STORAGE_KEY] && Array.isArray(importedData[MY_LIST_STORAGE_KEY])) {
            localStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(importedData[MY_LIST_STORAGE_KEY]));
            console.log('My List data imported successfully.');
          } else {
            console.warn('No valid My List data found in the import file.');
          }

          alert('Import successful! Please refresh the page to see changes.');
          // A full reload might be necessary to ensure all child components re-initialize with new data
          // window.location.reload(); // Consider if this is needed based on your data flow
        } else {
          alert('Invalid file format. Expected a JSON object with specific keys.');
        }
      } catch (error) {
        console.error('Invalid JSON or unexpected file content:', error);
        alert('Failed to import file. Please ensure it is a valid JSON file with correct structure.');
      }
      // Reset the file input to allow re-importing the same file
      input.value = '';
    };

    reader.readAsText(file);
  }
}
