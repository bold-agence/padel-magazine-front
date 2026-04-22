import { Component } from '@angular/core';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-international-page',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './international.page.html',
  styleUrl: './international.page.scss',
})
export class InternationalPage {}
