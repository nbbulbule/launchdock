import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { BreakpointObserver, Breakpoints, LayoutModule } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ShortTabComponent } from './short-tab/short-tab.component';
import { MyListComponent } from './my-list/my-list.component';
import { GoogleServiceComponent } from './google-service/google-service.component';
import { ConfigService } from './services/app-config.service';
import { IndexedDBService } from './services/indexdb.service';

const SHORT_TAB_STORAGE_KEY = 'shortTabData';
const MY_LIST_STORAGE_KEY = 'myListData';

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        LayoutModule,
        ShortTabComponent,
        MyListComponent,
        GoogleServiceComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title: string = "";
  tagline: string = "";
  exportFileName: string = "";
  showSettingsMenu = false;
  isMobile = false;
  backgroundColorEnabled = true;
  private destroy$ = new Subject<void>();

  constructor(
    private renderer: Renderer2,
    private breakpointObserver: BreakpointObserver,
    private configService: ConfigService,
    private dbService: IndexedDBService
  ) {}

  ngOnInit() {
    this.toggleBackgroundColor();

    this.breakpointObserver.observe([
      Breakpoints.HandsetPortrait,
      Breakpoints.Small,
      Breakpoints.TabletPortrait,
      Breakpoints.WebPortrait
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      this.isMobile = result.matches;
    });

    const config = this.configService.getConfig();
    if (config?.appName && config?.tagline && config?.exportFileName) {
      this.title = config.appName;
      this.tagline = config.tagline;
      this.exportFileName = config.exportFileName;
      console.log("config file details", config);
    } else {
      this.title = "Launch Dock";
      this.tagline = "tagline here";
      this.exportFileName = "launchdock-data";
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSettingsMenu() {
    this.showSettingsMenu = !this.showSettingsMenu;
  }

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
   * Exports all application data from IndexedDB into a single JSON file.
   */
  async exportAllDataToJsonFile(): Promise<void> {
    try {
      const [shortTabData, myListData] = await Promise.all([
        this.dbService.getData(SHORT_TAB_STORAGE_KEY),
        this.dbService.getData(MY_LIST_STORAGE_KEY)
      ]);

      const allData = {
        [SHORT_TAB_STORAGE_KEY]: shortTabData ?? [],
        [MY_LIST_STORAGE_KEY]: myListData ?? []
      };

      const data = JSON.stringify(allData, null, 2);

      const now = new Date();
      const timestamp = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

      const fileName = this.exportFileName + '-' + timestamp + '.json';

      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      anchor.click();

      window.URL.revokeObjectURL(url);
      alert('All application data exported successfully!');
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Export failed. Please try again.');
    }
  }

  /**
   * Imports application data from a JSON file and stores it into IndexedDB.
   */
  importAllDataFromJsonFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const importedData = JSON.parse(reader.result as string);

        if (typeof importedData === 'object' && importedData !== null) {
          const tabData = importedData[SHORT_TAB_STORAGE_KEY] ?? importedData['tabData-dev'];
          if (tabData && Array.isArray(tabData)) {
            await this.dbService.saveData(SHORT_TAB_STORAGE_KEY, tabData);
            console.log('Short tab data imported successfully.');
          } else {
            console.warn('No valid short tab data found.');
          }

          if (importedData[MY_LIST_STORAGE_KEY] && Array.isArray(importedData[MY_LIST_STORAGE_KEY])) {
            await this.dbService.saveData(MY_LIST_STORAGE_KEY, importedData[MY_LIST_STORAGE_KEY]);
            console.log('My list data imported successfully.');
          } else {
            console.warn('No valid my list data found.');
          }

          

          alert('Import successful! Please refresh the page to see changes.');
          // Optionally:
          // window.location.reload();
        } else {
          alert('Invalid file format. Expected a JSON object with specific keys.');
        }
      } catch (error) {
        console.error('Error reading imported file:', error);
        alert('Failed to import file. Please ensure it is a valid JSON file.');
      }

      input.value = '';
    };

    reader.readAsText(file);
  }
}
