import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuillModule } from 'ngx-quill';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
// Import CryptoService and EncryptedData interface
import { CryptoService, EncryptedData } from '../services/crypto.service';
import { ConfigService } from '../services/app-config.service';

// Define the interface for the data passed to this dialog
interface DialogData {
  name: string;
  infoDetails?: string | EncryptedData; // Can be string (unencrypted) or EncryptedData
  masterPassword: string; // The master password must be passed for decryption/encryption
}

@Component({
  selector: 'app-full-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule, MatButtonModule],
  templateUrl: './full-text-editor.component.html',
  styleUrl: './full-text-editor.component.css',
})
export class FullTextEditorComponent implements OnInit {
  // This will hold the DECRYPTED string content for the Quill editor
  infoDetails: string = '';
  // This will hold the ORIGINAL (potentially encrypted) data for cancellation
  oldData: string | EncryptedData | undefined;
  itemName: string = '';
  private masterPassword: string = ''; // Store master password locally for crypto operations

  // Quill editor configuration
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
    private configService: ConfigService,
    private dialogRef: MatDialogRef<FullTextEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, // Use the defined DialogData interface
    private cryptoService: CryptoService // Inject CryptoService
  ) {
    if (data) {
      this.oldData = data.infoDetails; // Store original data for cancel
      this.itemName = data.name;
      this.masterPassword = data.masterPassword; // Get master password
    }
  }

  async ngOnInit(): Promise<void> {
    // Decrypt infoDetails when the dialog initializes
    if (this.oldData) {
      const config = this.configService.getConfig();
      if (config && config.masterpasswordforEncryption) {
        this.masterPassword = config.masterpasswordforEncryption;
      } else {
        console.warn(
          'master password not found in configuration. Using fallback.'
        );
        // Fallback if config isn't loaded or URL is missing
        this.masterPassword = '';
      }
      if (typeof this.oldData !== 'string') {
        // It's an EncryptedData object
        try {
          this.infoDetails = await this.cryptoService.decrypt(
            this.oldData,
            this.masterPassword
          );
        } catch (error) {
          console.error('Failed to decrypt infoDetails on dialog open:', error);
          alert(
            'Failed to decrypt information. Password might be incorrect or data corrupted. Please check your master password.'
          );
          this.infoDetails = '[Decryption Failed]'; // Show placeholder
          // Optionally, close dialog or disable saving if decryption fails critically
          // this.dialogRef.close(this.oldData);
        }
      } else {
        this.infoDetails = this.oldData; // It's an unencrypted string
      }
    }
  }

  getInfoDetailsSize(): string {
    const bytes = new Blob([this.infoDetails || '']).size;
    const kb = (bytes / 1024).toFixed(2);
    return `${kb} KB (${bytes} bytes)`;
  }

  async onSave(): Promise<void> {
    if (!this.masterPassword) {
      alert('Master password is required to save encrypted data.');
      this.dialogRef.close(this.oldData); // Close without saving changes
      return;
    }

    try {
      // Encrypt the current infoDetails string before closing the dialog
      const encryptedData = await this.cryptoService.encrypt(
        this.infoDetails || '',
        this.masterPassword
      );
      this.dialogRef.close(encryptedData); // Return the EncryptedData object
    } catch (error) {
      console.error('Failed to encrypt infoDetails on save:', error);
      alert(
        'Failed to encrypt data for saving. Please check your master password.'
      );
      this.dialogRef.close(this.oldData); // Close without saving changes
    }
  }

  onCancel(): void {
    // On cancel, return the original (potentially encrypted) data
    this.dialogRef.close(this.oldData);
  }
}
