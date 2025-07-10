import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // For prompt input
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { IndexedDBService } from '../services/indexdb.service';

// Interface for a single item within a category
interface CategoryItem {
  id: string;
  name: string;
  link: string;
  icon?: string;
  infoDetails?: string;
}

// Interface for a category, containing a list of items
interface Category {
  id: string;
  name: string;
  items: CategoryItem[];
}

@Component({
  selector: 'app-my-list',
  standalone: true, // Mark component as standalone
  imports: [
    CommonModule, // Required for common directives like *ngIf, *ngFor
    FormsModule, // Required for prompt/input handling
    DragDropModule, // Required for CdkDragDrop
  ],
  templateUrl: './my-list.component.html',
  styleUrls: ['./my-list.component.css'],
})
export class MyListComponent implements OnInit {
  categories: Category[] = [];
  activeCategoryId: string = '';
  activeCategory: Category | undefined;
  // Unique local storage key for my-list data
  listIndexDBTableName: string = 'myListData';

  constructor(private dialog: MatDialog, private dbService: IndexedDBService) {}

  ngOnInit(): void {
    // Load categories data from local storage on initialization
    this.loadCategories();
  }

  openEditInfoDialog(item: CategoryItem) {
    if (!item.infoDetails) {
      item.infoDetails = '';
    }
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      panelClass: 'light-dialog',
      width: '1000vw',
      data: item,
      height: '1000vh',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        item.infoDetails = result;
        console.log('Updated:', result);
        this.saveCategories();
      }
    });
  }
  /**
   * Loads categories data from local storage.
   * If data exists, it parses it and sets the first category as active.
   */
  async loadCategories(): Promise<void> {
    try {
      await this.dbService.isReady(); // <- wait for DB
      const stored = await this.dbService.getData<Category[]>(
        this.listIndexDBTableName
      );
      if (stored && Array.isArray(stored)) {
        this.categories = stored;
        if (this.categories.length > 0) {
          this.activeCategoryId = this.categories[0].id;
          this.selectCategory(this.activeCategoryId);
        }
      }
    } catch (e) {
      console.error('Error loading categories from IndexedDB:', e);
      this.categories = [];
    }
  }

  /**
   * Returns a favicon URL for a given link.
   * @param url The URL to get the favicon for.
   * @returns A Google favicon service URL.
   */
  getFavicon(url: string): string {
    if (url?.trim().length == 0) '';
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`; // sz=16 for smaller icons
    } catch {
      return ''; // Or a default placeholder image URL
    }
  }

  /**
   * Selects a category to display its items.
   * @param id The ID of the category to select.
   */
  selectCategory(id: string) {
    this.activeCategoryId = id;
    this.activeCategory = this.categories.find((cat) => cat.id === id);
  }

  /**
   * Adds a new category after prompting for a name.
   * Sets the new category as active and saves to local storage.
   */
  addCategory() {
    const newName = prompt('Enter new category name:');
    if (newName && newName.trim() !== '') {
      const newId = `cat-${Date.now()}`; // Unique ID for the new category
      this.categories.push({ id: newId, name: newName.trim(), items: [] });
      this.selectCategory(newId); // Make the new category active
      this.saveCategories(); // Save changes
    }
  }

  /**
   * Edits the name of an existing category.
   * @param category The category object to edit.
   */
  editCategory(category: Category) {
    const newName = prompt('Edit category name:', category.name);
    if (
      newName !== null &&
      newName.trim() !== '' &&
      newName !== category.name
    ) {
      category.name = newName.trim();
      this.saveCategories();
    }
  }

  /**
   * Deletes a category by its ID.
   * Adjusts the active category if the deleted category was active.
   * Saves changes to local storage.
   * @param id The ID of the category to delete.
   */
  deleteCategory(id: string) {
    const categoryToDelete = this.categories.find((cat) => cat.id === id);
    if (categoryToDelete) {
      if (
        !confirm(
          `Category "${categoryToDelete.name}" Are you sure you want to delete it?`
        )
      ) {
        return; // User cancelled
      }
    }

    this.categories = this.categories.filter((cat) => cat.id !== id);
    // If the deleted category was active, switch to the first available category
    if (this.activeCategoryId === id) {
      this.activeCategoryId =
        this.categories.length > 0 ? this.categories[0].id : '';
      this.activeCategory =
        this.categories.length > 0 ? this.categories[0] : undefined;
    }
    this.saveCategories();
  }

  /**
   * Adds a new item to the specified category after prompting for name and link.
   * @param category The category to add the item to.
   */
  addItemToCategory(category: Category) {
    const name = prompt('Enter item name:');
    if (!name || name.trim() === '') return;

    let link = prompt('Enter item link (e.g., https://example.com):');
    if (!link || link.trim() === '') link = '';

    // // Validate URL format
    try {
      new URL(link);
    } catch (e) {
      //alert('Invalid URL format. Please enter a valid URL.');
      //return;
      link = '';
    }

    // Check for duplicate links within the same category
    if (category.items.some((item) => item.name === name?.trim())) {
      alert('This link is already saved in this category. Please try another.');
      return;
    }

    const newItemId = `item-${Date.now()}`;
    category.items.push({
      id: newItemId,
      name: name.trim(),
      link: link?.trim() ?? '',
      icon: this.getFavicon(link ?? ''),
    });
    this.saveCategories();
  }

  /**
   * Edits an existing item within a category.
   * @param category The category the item belongs to.
   * @param itemToEdit The item object to edit.
   */
  editItem(category: Category, itemToEdit: CategoryItem) {
    const newName = prompt('Edit item name:', itemToEdit.name);
    let newLink = prompt('Edit item link:', itemToEdit.link);

    if (newName !== null && newName.trim() !== '') {
      // Validate new URL format
      if (newLink == null || newLink?.trim().length == 0) newLink = '';
      try {
        new URL(newLink);
      } catch (e) {
        //alert('Invalid URL format. Please enter a valid URL.');
        //return;
        newLink = '';
      }

      // Check for duplicate links among other items in the same category
      if (
        category.items.some(
          (item) => item.name === newName.trim() && item.id !== itemToEdit.id
        )
      ) {
        alert(
          'This link is already saved in this category for another item. Please try another.'
        );
        return;
      }

      itemToEdit.name = newName.trim();
      itemToEdit.link = newLink.trim();
      itemToEdit.icon = this.getFavicon(newLink.trim()); // Update favicon if link changes
      this.saveCategories();
    }
  }

  /**
   * Deletes an item from a specified category by its ID.
   * @param category The category the item belongs to.
   * @param itemId The ID of the item to delete.
   */
  deleteItem(category: Category, itemId: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      category.items = category.items.filter((item) => item.id !== itemId);
      this.saveCategories();
    }
  }

  /**
   * Saves the current `categories` array to local storage.
   */
  saveCategories(): void {
    this.dbService
      .saveData(this.listIndexDBTableName, this.categories)
      .catch((err) =>
        console.error('Error saving categories to IndexedDB:', err)
      );
  }

  /**
   * Handles drag and drop reordering of categories.
   * Saves the new order to local storage.
   * @param event CdkDragDrop event for categories.
   */
  dropCategory(event: CdkDragDrop<Category[]>) {
    moveItemInArray(this.categories, event.previousIndex, event.currentIndex);
    this.saveCategories();
  }

  /**
   * Handles drag and drop reordering of items within the active category.
   * Saves the new order to local storage.
   * @param event CdkDragDrop event for items.
   */
  dropItem(event: CdkDragDrop<CategoryItem[]>) {
    if (this.activeCategory && this.activeCategory.items) {
      moveItemInArray(
        this.activeCategory.items,
        event.previousIndex,
        event.currentIndex
      );
      this.saveCategories();
    }
  }
}
