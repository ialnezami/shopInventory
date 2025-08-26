import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <h2>Sales List</h2>
      <p>Sales management coming soon...</p>
    </div>
  `,
  styles: []
})
export class SalesListComponent {}
