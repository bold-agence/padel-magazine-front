import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [SidebarComponent, RouterLink],
  templateUrl: './article.page.html',
  styleUrl: './article.page.scss',
})
export class ArticlePage {}
