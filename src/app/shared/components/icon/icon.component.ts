import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type IconName =
  | 'search'
  | 'cart'
  | 'heart'
  | 'heart-filled'
  | 'user'
  | 'menu'
  | 'close'
  | 'star'
  | 'star-filled'
  | 'filter'
  | 'grid'
  | 'list'
  | 'check'
  | 'plus'
  | 'minus'
  | 'trash'
  | 'eye'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'shield-check'
  | 'truck'
  | 'rotate-ccw'
  | 'clock'
  | 'phone'
  | 'mail'
  | 'map-pin'
  | 'sparkles'
  | 'award'
  | 'glasses'
  | 'share'
  | 'whatsapp';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      [attr.stroke]="fillColor ? 'none' : 'currentColor'"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [style.display]="'inline-block'"
      [style.vertical-align]="'middle'"
      [ngSwitch]="name"
    >
      <!-- search -->
      <ng-container *ngSwitchCase="'search'">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </ng-container>

      <!-- cart -->
      <ng-container *ngSwitchCase="'cart'">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </ng-container>

      <!-- heart -->
      <ng-container *ngSwitchCase="'heart'">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </ng-container>

      <!-- heart-filled -->
      <ng-container *ngSwitchCase="'heart-filled'">
        <path fill="#C0392B" stroke="#C0392B" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </ng-container>

      <!-- user -->
      <ng-container *ngSwitchCase="'user'">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </ng-container>

      <!-- menu -->
      <ng-container *ngSwitchCase="'menu'">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </ng-container>

      <!-- close -->
      <ng-container *ngSwitchCase="'close'">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </ng-container>

      <!-- star -->
      <ng-container *ngSwitchCase="'star'">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </ng-container>

      <!-- star-filled -->
      <ng-container *ngSwitchCase="'star-filled'">
        <polygon fill="#C5A880" stroke="#C5A880" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </ng-container>

      <!-- filter -->
      <ng-container *ngSwitchCase="'filter'">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
      </ng-container>

      <!-- grid -->
      <ng-container *ngSwitchCase="'grid'">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </ng-container>

      <!-- list -->
      <ng-container *ngSwitchCase="'list'">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </ng-container>

      <!-- check -->
      <ng-container *ngSwitchCase="'check'">
        <polyline points="20 6 9 17 4 12"></polyline>
      </ng-container>

      <!-- plus -->
      <ng-container *ngSwitchCase="'plus'">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </ng-container>

      <!-- minus -->
      <ng-container *ngSwitchCase="'minus'">
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </ng-container>

      <!-- trash -->
      <ng-container *ngSwitchCase="'trash'">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </ng-container>

      <!-- eye -->
      <ng-container *ngSwitchCase="'eye'">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </ng-container>

      <!-- arrow-right -->
      <ng-container *ngSwitchCase="'arrow-right'">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </ng-container>

      <!-- arrow-left -->
      <ng-container *ngSwitchCase="'arrow-left'">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </ng-container>

      <!-- chevron-down -->
      <ng-container *ngSwitchCase="'chevron-down'">
        <polyline points="6 9 12 15 18 9"></polyline>
      </ng-container>

      <!-- chevron-up -->
      <ng-container *ngSwitchCase="'chevron-up'">
        <polyline points="18 15 12 9 6 15"></polyline>
      </ng-container>

      <!-- shield-check -->
      <ng-container *ngSwitchCase="'shield-check'">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <polyline points="9 12 11 14 15 10"></polyline>
      </ng-container>

      <!-- truck -->
      <ng-container *ngSwitchCase="'truck'">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </ng-container>

      <!-- rotate-ccw -->
      <ng-container *ngSwitchCase="'rotate-ccw'">
        <polyline points="1 4 1 10 7 10"></polyline>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
      </ng-container>

      <!-- clock -->
      <ng-container *ngSwitchCase="'clock'">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </ng-container>

      <!-- phone -->
      <ng-container *ngSwitchCase="'phone'">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </ng-container>

      <!-- mail -->
      <ng-container *ngSwitchCase="'mail'">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </ng-container>

      <!-- map-pin -->
      <ng-container *ngSwitchCase="'map-pin'">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </ng-container>

      <!-- sparkles -->
      <ng-container *ngSwitchCase="'sparkles'">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
      </ng-container>

      <!-- award -->
      <ng-container *ngSwitchCase="'award'">
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      </ng-container>

      <!-- glasses -->
      <ng-container *ngSwitchCase="'glasses'">
        <circle cx="6" cy="14" r="4"></circle>
        <circle cx="18" cy="14" r="4"></circle>
        <path d="M10 14h4"></path>
        <path d="M2 14h.5M21.5 14H22"></path>
        <path d="M6 10l2-6M18 10l-2-6"></path>
      </ng-container>

      <!-- share -->
      <ng-container *ngSwitchCase="'share'">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </ng-container>

      <!-- whatsapp -->
      <ng-container *ngSwitchCase="'whatsapp'">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </ng-container>
    </svg>
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size: number = 20;
  @Input() strokeWidth: number = 1.75;
  @Input() fillColor?: string;
}

