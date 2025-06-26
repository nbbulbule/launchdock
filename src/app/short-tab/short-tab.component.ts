import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // For prompt input

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
  localStorageName: string = 'tabData-dev'; // Use 'tabData' for production

  constructor() { }

  ngOnInit() {
    // Load tabs data from local storage on initialization
    this.loadTabs();
  }

  /**
   * Loads tabs data from local storage.
   * If data exists, it parses it and sets the first tab as active.
   */
  loadTabs(): void {
    const stored = localStorage.getItem(this.localStorageName);
    if (stored) {
      try {
        this.tabs = JSON.parse(stored);
        if (this.tabs.length > 0) {
          // Set the first tab as active if none is active or active tab was deleted
          this.activeTabId = this.tabs[0].id;
        }
      } catch (e) {
        console.error('Error parsing stored tab data:', e);
        this.tabs = []; // Reset if data is corrupted
        localStorage.removeItem(this.localStorageName); // Clear corrupted data
      }
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
  addTab() {
    const name = prompt('Enter tab name:');
    if (name) {
      const id = 'tab-' + Date.now(); // Unique ID for the new tab
      this.tabs.push({ id, name, shortcuts: [] });
      this.activeTabId = id; // Make the new tab active
      this.saveTabs(); // Save changes to local storage
    }
  }

  /**
   * Edits the name of an existing tab after prompting for a new name.
   * Saves changes to local storage.
   * @param tab The tab object to edit.
   */
  editTab(tab: Tab) {
    const name = prompt('Edit tab name:', tab.name);
    if (name !== null && name.trim() !== '' && name !== tab.name) {
      tab.name = name.trim();
      this.saveTabs();
    }
  }

  /**
   * Deletes a tab by its ID.
   * Adjusts the active tab if the deleted tab was active.
   * Saves changes to local storage.
   * @param tabId The ID of the tab to delete.
   */
  deleteTab(tabId: string) {
    // Confirm deletion if there are shortcuts, otherwise proceed
    const tabToDelete = this.tabs.find(t => t.id === tabId);
    if (tabToDelete && tabToDelete.shortcuts.length > 0) {
      if (!confirm(`Tab "${tabToDelete.name}" contains shortcuts. Are you sure you want to delete it?`)) {
        return; // User cancelled
      }
    }

    this.tabs = this.tabs.filter((t) => t.id !== tabId);
    // If the deleted tab was active, switch to the first available tab
    if (this.activeTabId === tabId) {
      this.activeTabId = this.tabs.length > 0 ? this.tabs[0].id : '';
    }
    this.saveTabs();
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
  addShortcutToActiveTab() {
    if (!this.activeTab) {
      alert('Please select or add a tab first to add shortcuts.');
      return;
    }

    const url = prompt('Enter URL (e.g., https://example.com):');
    if (!url || url.trim() === '') return;

    // Validate URL format
    try {
      new URL(url); // Attempt to create a URL object to validate
    } catch (e) {
      alert('Invalid URL format. Please enter a valid URL.');
      return;
    }

    // Check for duplicate URLs within the active tab
    const matchedUrl = this.activeTab.shortcuts.some((s) => s.url === url.trim());
    if (matchedUrl) {
      alert('This URL is already saved in the current tab. Please try another.');
      return;
    }

    const title = prompt('Enter Title for the shortcut:');
    if (!title || title.trim() === '') return;

    const favicon = this.getFavicon(url);
    const newShortcut: Shortcut = {
      url: url.trim(),
      title: title.trim(),
      favicon,
    };
    this.activeTab.shortcuts.push(newShortcut);
    this.saveTabs(); // Save changes
  }

  /**
   * Saves the current `tabs` array to local storage.
   */
  saveTabs() {
    localStorage.setItem(this.localStorageName, JSON.stringify(this.tabs));
  }

  /**
   * Deletes a shortcut from the active tab by its URL.
   * Saves changes to local storage.
   * @param url The URL of the shortcut to delete.
   */
  deleteUrl(url: string) {
    if (!this.activeTab) return;

    if (confirm('Are you sure you want to delete this shortcut?')) {
      this.activeTab.shortcuts = this.activeTab.shortcuts.filter(
        (s) => s.url !== url
      );
      this.saveTabs();
    }
  }

  /**
   * Handles drag and drop reordering of tabs.
   * Saves the new order to local storage.
   * @param event CdkDragDrop event for tabs.
   */
  dropTab(event: CdkDragDrop<Tab[]>) {
    moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
    this.saveTabs();
  }

  /**
   * Handles drag and drop reordering of shortcuts within the active tab.
   * Saves the new order to local storage.
   * @param event CdkDragDrop event for shortcuts.
   */
  dropShortcut(event: CdkDragDrop<Shortcut[]>) {
    if (!this.activeTab || !this.activeTab.shortcuts) return;
    moveItemInArray(this.activeTab.shortcuts, event.previousIndex, event.currentIndex);
    this.saveTabs();
  }
}
