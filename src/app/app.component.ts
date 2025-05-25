import { Component,Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CdkDragDrop, moveItemInArray,DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,  
  imports: [RouterOutlet, CommonModule, FormsModule, DragDropModule],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'LΛUNCH DØCK';  
  tagline ='A launching point for tools, apps, or sites from one centralized location';
  tabs: Tab[] = [];
  activeTabId: string = '';
  backgroundColorEnabled = true;
  username ='Nagesh B.';
  
  constructor(private renderer: Renderer2) {this.toggleBackgroundColor();}
  
  ngOnInit() {
    const stored = localStorage.getItem('tabData');
    if (stored) {
      this.tabs = JSON.parse(stored);
      if (this.tabs.length > 0) {
        this.activeTabId = this.tabs[0].id;
      }
    }
    
  }

   showSettingsMenu = false;

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
  getFavicon(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}`;
    } catch {
      return '';
    }
  }

  getDomainName(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }
  
exportToJsonFile(): void {
  const storageKey = 'tabData'; // or make it dynamic if needed
  const rawData = localStorage.getItem(storageKey) || '[]';
  const data = JSON.stringify(JSON.parse(rawData), null, 2);

  // Create formatted timestamp: ddMMyyyyHHmmss
  const now = new Date();
  const timestamp = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

  // Create filename like: tabData-21052025104530-saved-urls.json
  const fileName = `${storageKey}-${timestamp}-saved-urls.json`;

  const blob = new Blob([data], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  window.URL.revokeObjectURL(url);
}

importFromJsonFile(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const jsonData = JSON.parse(reader.result as string);

      if (Array.isArray(jsonData)) {
        // Optional: Validate structure here
        localStorage.setItem('tabData', JSON.stringify(jsonData));
        alert('Import successful!');
      } else {
        alert('Invalid file format. Expected an array.');
      }
    } catch (error) {
      console.error('Invalid JSON:', error);
      alert('Failed to import file.');
    }
  };

  reader.readAsText(file);
}
  get activeTab(): Tab | undefined {
    return this.tabs.find((tab) => tab.id === this.activeTabId);
  }

  addTab() {
    const name = prompt('Enter tab name:');
    if (name) {
      const id = 'tab-' + Date.now();
      this.tabs.push({ id, name, shortcuts: [] });
      this.activeTabId = id;
      this.save();
    }
  }

  editTab(tab: Tab) {
    const name = prompt('Edit tab name:', tab.name);
    if (name && name !== tab.name) {
      tab.name = name;
      this.save();
    }
  }

  deleteTab(tabId: string) {
    this.tabs = this.tabs.filter((t) => t.id !== tabId);
    if (this.activeTabId === tabId && this.tabs.length > 0) {
      this.activeTabId = this.tabs[0].id;
    }
    this.save();
  }
  
  selectTab(id: string) {
    this.activeTabId = id;     
  }
  
  addShortcutToActiveTab() {
    const url = prompt('Enter URL:');
    if (!url) return;

    if (!this.activeTab) return;

    var matchedUrl = this.activeTab.shortcuts.filter((s) => s.url === url);
    if (matchedUrl.length > 0) {
      alert('same url already saved, please try another!');
      return;
    }

    const title = prompt('Enter Title:');
    if (!title) return;

    const promptTitle: string = title;//this.getDomainName(url);
    const favicon = this.getFavicon(url);    
    const tempObj: Shortcut = {
      url,
      title: promptTitle,
      favicon,
    };
    this.activeTab?.shortcuts.push(tempObj);
    this.save();
  }

  save() {
    localStorage.setItem('tabData', JSON.stringify(this.tabs));
  }
  deleteUrl(url: string) {
    if (!this.activeTab) return;

    this.activeTab.shortcuts = this.activeTab.shortcuts.filter(
      (s) => s.url !== url
    );

    this.save();
  }

  dropTab(event: CdkDragDrop<any[]>) {
  moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
  this.save(); // Save new order to localStorage
}


dropShortcut(event: CdkDragDrop<any[]>) {
  if (!this.activeTab || !this.activeTab.shortcuts) return;
  moveItemInArray(this.activeTab.shortcuts, event.previousIndex, event.currentIndex);
  this.save();
}

}
interface Shortcut {
  title: string;
  url: string;
  favicon?: string;
}

interface Tab {
  id: string;
  name: string;
  shortcuts: Shortcut[];
}

//manifest.json file data here 
//create manifest.json file in dist for make sure it's extension for browser
//Article here to read it and implement it - https://infolink.hashnode.dev/steps-to-convert-an-angular-app-into-a-browser-extension
/*
{
  "manifest_version": 3,
  "name": "My Shortcut Dashboard",
  "version": "1.0",
  "description": "A local tab and shortcut manager",
  "chrome_url_overrides": {
    "newtab": "index.html"
  },
  "icons": {
    "128": "favicon.ico"
  },
  "permissions": ["storage"],
  "action": {
    "default_title": "Shortcut Manager"
  }
}


*/
