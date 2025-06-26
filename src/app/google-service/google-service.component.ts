
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For common directives
import { MatTabsModule } from '@angular/material/tabs'; // For Angular Material tabs

@Component({
  selector: 'app-google-service',
  standalone: true, // Mark component as standalone
  imports: [
    CommonModule, // Required for common directives
    MatTabsModule // Required for MatTabGroup and MatTab
  ],
  templateUrl: './google-service.component.html',
  styleUrls: ['./google-service.component.css']
})
export class GoogleServiceComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
}
