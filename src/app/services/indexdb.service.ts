// src/app/services/indexeddb.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private dbName = 'MyListAppDB';
  private storeName = 'categories';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }
  isReady(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (this.db) {
      resolve();
    } else {
      const interval = setInterval(() => {
        if (this.db) {
          clearInterval(interval);
          resolve();
        }
      }, 50);

      // Optional timeout after 3 seconds
      setTimeout(() => {
        clearInterval(interval);
        reject('Timeout: IndexedDB not initialized');
      }, 3000);
    }
  });
}

  private initDB(): void {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName);
      }
    };

    request.onsuccess = (event: any) => {
      this.db = event.target.result as IDBDatabase;
    };

    request.onerror = (event) => {
      console.error('IndexedDB initialization error:', event);
    };
  }

  saveData(key: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not ready');
      const tx = this.db.transaction([this.storeName], 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(data, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  getData<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) return reject('DB not ready');
      const tx = this.db.transaction([this.storeName], 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  }
}
