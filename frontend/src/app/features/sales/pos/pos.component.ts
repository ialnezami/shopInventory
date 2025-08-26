import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <h2>Point of Sale</h2>
      <p>POS system coming soon...</p>
    </div>
  `,
  styles: []
})
export class PosComponent {}
