import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // For prompt input
import { IndexedDBService } from '../services/indexdb.service';
// Interface for a single shortcut item
interface Shortcut {
  title: string;
  url: string;
  favicon?: string;
}

// Interface for a tab, containing a list of shortcuts
interface Tab {
  id: string;
  name: string;
  shortcuts: Shortcut[];
}

@Component({
  selector: 'app-short-tab',
  standalone: true, // Mark component as standalone
  imports: [
    CommonModule, // Required for common directives like *ngIf, *ngFor
    FormsModule,  // Required for prompt/input handling (implicitly used by `prompt`)
    DragDropModule // Required for CdkDragDrop
  ],
  templateUrl: './short-tab.component.html',
  styleUrls: ['./short-tab.component.css']
})
export class ShortTabComponent implements OnInit {
  tabs: Tab[] = [];
  activeTabId: string = '';
  // Unique local storage key for short-tab data
  tabIndexDBKey: string = 'shortTabData'; // Use 'tabData' for production  
  constructor(private dbService: IndexedDBService) { }

  ngOnInit(): void {
    // Load tabs data from local storage on initialization
    this.loadTabs();
  }
 

  /**
   * Loads tabs data from local storage.
   * If data exists, it parses it and sets the first tab as active.
   */
 async loadTabs(): Promise<void> {
  try {
    await this.dbService.isReady(); // Wait for IndexedDB to be ready
    const stored = await this.dbService.getData<Tab[]>(this.tabIndexDBKey);
    if (stored && Array.isArray(stored)) {
      this.tabs = stored;
      if (this.tabs.length > 0) {
        this.activeTabId = this.tabs[0].id;
      }
    }
  } catch (e) {
    console.error('Error loading tabs from IndexedDB:', e);
    this.tabs = [];
  }
}

  /**
   * Returns the currently active tab object based on `activeTabId`.
   * @returns The active Tab object or undefined if no tab is active.
   */
  get activeTab(): Tab | undefined {
    return this.tabs.find((tab) => tab.id === this.activeTabId);
  }

  /**
   * Generates a favicon URL for a given website URL using Google's favicon service.
   * @param url The URL of the website.
   * @returns The URL of the favicon image.
   */
  getFavicon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`; // sz=32 for 32x32 size
    } catch {
      return ''; // Return empty string or a default placeholder if URL is invalid
    }
  }

  /**
   * Extracts the domain name from a given URL.
   * @param url The URL string.
   * @returns The domain name (e.g., 'google.com' from 'https://www.google.com/').
   */
  getDomainName(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url; // Return original URL if invalid
    }
  }

  /**
   * Adds a new tab after prompting for a name.
   * Sets the new tab as active and saves to local storage.
   */
  addTab(): void {
  const name = prompt('Enter tab name:');
  if (name) {
    const id = 'tab-' + Date.now();
    this.tabs.push({ id, name, shortcuts: [] });
    this.activeTabId = id;
    this.saveTabs(); // Uses IndexedDB now
  }
}

  /**
   * Edits the name of an existing tab after prompting for a new name.
   * Saves changes to local storage.
   * @param tab The tab object to edit.
   */
  editTab(tab: Tab): void {
  const name = prompt('Edit tab name:', tab.name);
  if (name !== null && name.trim() !== '' && name !== tab.name) {
    tab.name = name.trim();
    this.saveTabs(); // Uses IndexedDB
  }
}

  /**
   * Deletes a tab by its ID.
   * Adjusts the active tab if the deleted tab was active.
   * Saves changes to local storage.
   * @param tabId The ID of the tab to delete.
   */
 deleteTab(tabId: string): void {
  const tabToDelete = this.tabs.find(t => t.id === tabId);
  if (tabToDelete && !confirm(`Tab "${tabToDelete.name}" Are you sure you want to delete it?`)) {
    return;
  }

  this.tabs = this.tabs.filter(t => t.id !== tabId);
  if (this.activeTabId === tabId) {
    this.activeTabId = this.tabs.length > 0 ? this.tabs[0].id : '';
  }
  this.saveTabs(); // Uses IndexedDB
}
  /**
   * Sets the specified tab as the active tab.
   * @param id The ID of the tab to activate.
   */
  selectTab(id: string) {
    this.activeTabId = id;
  }

  /**
   * Adds a new shortcut to the currently active tab after prompting for URL and title.
   * Prevents adding duplicate URLs within the same tab.
   * Saves changes to local storage.
   */
  addShortcutToActiveTab(): void {
  if (!this.activeTab) {
    alert('Please select or add a tab first to add shortcuts.');
    return;
  }

  const url = prompt('Enter URL (e.g., https://example.com):');
  if (!url || url.trim() === '') return;

  try {
    new URL(url); // Validate
  } catch {
    alert('Invalid URL format.');
    return;
  }

  if (this.activeTab.shortcuts.some(s => s.url === url.trim())) {
    alert('This URL is already saved.');
    return;
  }

  const title = prompt('Enter Title for the shortcut:');
  if (!title || title.trim() === '') return;

  const shortcut: Shortcut = {
    title: title.trim(),
    url: url.trim(),
    favicon: this.getFavicon(url.trim())
  };

  this.activeTab.shortcuts.push(shortcut);
  this.saveTabs(); // Uses IndexedDB
}

  /**
   * Saves the current `tabs` array to local storage.
   */
 saveTabs(): void {
  this.dbService.saveData(this.tabIndexDBKey, this.tabs)
    .catch(err => console.error('Error saving tabs to IndexedDB:', err));
}

  /**
   * Deletes a shortcut from the active tab by its URL.
   * Saves changes to local storage.
   * @param url The URL of the shortcut to delete.
   */
  deleteUrl(url: string): void {
  if (!this.activeTab) return;

  if (confirm('Are you sure you want to delete this shortcut?')) {
    this.activeTab.shortcuts = this.activeTab.shortcuts.filter(s => s.url !== url);
    this.saveTabs(); // Uses IndexedDB
  }
}

  /**
   * Handles drag and drop reordering of tabs.
   * Saves the new order to local storage.
   * @param event CdkDragDrop event for tabs.
   */
 dropTab(event: CdkDragDrop<Tab[]>): void {
  moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
  this.saveTabs();
}



  /**
   * Handles drag and drop reordering of shortcuts within the active tab.
   * Saves the new order to local storage.
   * @param event CdkDragDrop event for shortcuts.
   */
 dropShortcut(event: CdkDragDrop<Shortcut[]>): void {
  if (this.activeTab?.shortcuts) {
    moveItemInArray(this.activeTab.shortcuts, event.previousIndex, event.currentIndex);
    this.saveTabs();
  }
}
}
