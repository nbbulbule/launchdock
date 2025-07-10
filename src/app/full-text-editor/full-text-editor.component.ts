import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-full-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, MatButtonModule],
  templateUrl: './full-text-editor.component.html',
  styleUrl: './full-text-editor.component.css',
})
export class FullTextEditorComponent {
  infoDetails: any;
  oldData: any;
  itemName: any;
  editorModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction

      [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }], // dropdown with defaults
      [{ font: [] }],
      [{ align: [] }],

      ['link', 'image', 'video'], // media
      ['clean'], // remove formatting
    ],
  };

  constructor(
    private dialogRef: MatDialogRef<FullTextEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.oldData = data?.infoDetails;
      this.infoDetails = this.data?.infoDetails;
      this.itemName = this.data?.name;
    }
  }

  getInfoDetailsSize(): string {
    const bytes = new Blob([this.infoDetails || '']).size;
    const kb = (bytes / 1024).toFixed(2);
    return `${kb} KB (${bytes} bytes)`;
  }
  onSave(): void {
    this.dialogRef.close(this.infoDetails);
  }

  onCancel(): void {
    this.dialogRef.close(this.oldData);
  }
}

interface CategoryItem {
  id: string;
  name: string;
  link: string;
  icon?: string;
  infoDetails?: string;
}
