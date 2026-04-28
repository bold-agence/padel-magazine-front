import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-international-component',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './international.component.html',
  styleUrl: './international.component.scss',
})
export class InternationalComponent {}
