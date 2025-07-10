import { Component, Inject,ViewChild,
  ElementRef,
  AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

// Interface for a single item within a category
interface CategoryItem {
  id: string;
  name: string;
  link: string;
  icon?: string;
  infoDetails?: string;
}

@Component({
    selector: 'app-dialog-box',
    imports: [CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule],
    templateUrl: './dialog-box.component.html',
    styleUrl: './dialog-box.component.css'
})
export class DialogBoxComponent implements AfterViewInit {
  @ViewChild('formContainer') formContainer!: ElementRef;
   rowsTxtArea:number =5;
   infoDetails:any;   
   oldData:any ;
   itemName:any;

   ngAfterViewInit() {
    // Delay slightly to let layout stabilize
    setTimeout(() => {
      this.calculateTextareaRows();
    }, 100);
  }

  constructor(
    public dialogRef: MatDialogRef<DialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.oldData= data?.infoDetails;
      this.infoDetails = this.data?.infoDetails;  
      this.itemName = this.data?.name;    
    }
  }

  calculateTextareaRows() {
    const containerHeight = this.formContainer.nativeElement.offsetHeight;

    // Estimate rows based on ~24px per line (font-size + padding)
    const estimatedRows = Math.floor(containerHeight / 24);

    this.rowsTxtArea = Math.max(3, Math.min(estimatedRows, 20)); // clamp to 3–20 rows
  }
  onSave(): void {    
    this.dialogRef.close(this.infoDetails);
  }

  onCancel(): void {    
    this.dialogRef.close(this.oldData);
  }
}


