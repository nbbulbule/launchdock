import { Component, Inject } from '@angular/core';
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
  standalone: true,
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
export class DialogBoxComponent {
   rowsTxtArea:number = 8
   infoDetails:any;   
   oldData:any ;
   itemName:any;
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

  onSave(): void {    
    this.dialogRef.close(this.infoDetails);
  }

  onCancel(): void {    
    this.dialogRef.close(this.oldData);
  }
}


