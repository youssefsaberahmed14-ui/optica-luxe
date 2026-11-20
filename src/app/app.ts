import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnnouncementBarComponent } from './shared/components/announcement-bar/announcement-bar.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { QuickViewModalComponent } from './shared/components/quick-view-modal/quick-view-modal.component';
import { SearchModalComponent } from './shared/components/search-modal/search-modal.component';
import { ToastContainerComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AnnouncementBarComponent,
    HeaderComponent,
    FooterComponent,
    CartDrawerComponent,
    QuickViewModalComponent,
    SearchModalComponent,
    ToastContainerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}

