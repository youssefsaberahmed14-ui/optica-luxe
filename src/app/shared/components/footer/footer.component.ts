import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <!-- Trust badges bar -->
      <div class="footer-perks-bar">
        <div class="container perks-grid">
          <div class="perk-item">
            <div class="perk-icon-wrapper">
              <app-icon name="award" [size]="24"></app-icon>
            </div>
            <div class="perk-text">
              <h4>أصالة معتمدة 100%</h4>
              <p>وكيل وموزع رسمي لأشهر الماركات العالمية</p>
            </div>
          </div>

          <div class="perk-item">
            <div class="perk-icon-wrapper">
              <app-icon name="truck" [size]="24"></app-icon>
            </div>
            <div class="perk-text">
              <h4>توصيل مجاني فاخر</h4>
              <p>شحن سريع مؤمّن لكافة المناطق والخليج</p>
            </div>
          </div>

          <div class="perk-item">
            <div class="perk-icon-wrapper">
              <app-icon name="shield-check" [size]="24"></app-icon>
            </div>
            <div class="perk-text">
              <h4>ضمان وصيانة لمدة سنتين</h4>
              <p>تعديل وتلميع وضبط مجاني في جميع الفروع</p>
            </div>
          </div>

          <div class="perk-item">
            <div class="perk-icon-wrapper">
              <app-icon name="rotate-ccw" [size]="24"></app-icon>
            </div>
            <div class="perk-text">
              <h4>استبدال مرن وسهل</h4>
              <p>إمكانية الاستبدال مجاناً خلال 14 يوماً</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Footer Content -->
      <div class="container footer-main">
        <div class="footer-grid">
          <!-- Col 1: Brand Info -->
          <div class="footer-col brand-col">
            <a routerLink="/" class="footer-logo">
              <span class="logo-sub font-brand">HAUTE LUNETTERIE</span>
              <span class="logo-main">أوبتيكا لاكشري</span>
            </a>
            <p class="brand-desc">
              دار البصريات الفاخرة الرائدة في الشرق الأوسط. نقدم تجربة بصرية استثنائية تجمع بين الحرفية اليدوية الإيطالية العريقة وأحدث تقنيات العدسات البصرية الطبية.
            </p>
            <div class="store-meta">
              <div class="meta-row">
                <app-icon name="clock" [size]="16" class="gold-icon"></app-icon>
                <span>ساعات العمل: يومياً من 10:00 ص إلى 11:00 م</span>
              </div>
              <div class="meta-row">
                <app-icon name="phone" [size]="16" class="gold-icon"></app-icon>
                <span dir="ltr">+966 800 800 5893</span>
              </div>
              <div class="meta-row">
                <app-icon name="mail" [size]="16" class="gold-icon"></app-icon>
                <span dir="ltr">concierge&#64;optica-luxe.com</span>
              </div>
            </div>
          </div>

          <!-- Col 2: Categories -->
          <div class="footer-col">
            <h4 class="col-title">التشكيلات الفاخرة</h4>
            <ul class="footer-links">
              <li><a routerLink="/products" [queryParams]="{ category: 'sunglasses' }">نظارات شمسية رجالية ونسائية</a></li>
              <li><a routerLink="/products" [queryParams]="{ category: 'eyeglasses' }">نظارات طبية ذكية</a></li>
              <li><a routerLink="/products" [queryParams]="{ category: 'luxury-frames' }">إطارات مطلية بذهب عيار 18</a></li>
              <li><a routerLink="/products" [queryParams]="{ category: 'contact-lenses' }">عدسات لاصقة يومية وشهرية</a></li>
              <li><a routerLink="/products" [queryParams]="{ category: 'accessories' }">إكسسوارات وحقائب جلدية</a></li>
            </ul>
          </div>

          <!-- Col 3: Customer Service -->
          <div class="footer-col">
            <h4 class="col-title">خدمة العملاء</h4>
            <ul class="footer-links">
              <li><a routerLink="/contact">حجز موعد فحص نظر متقدم</a></li>
              <li><a routerLink="/cart">متابعة وحالة الطلب</a></li>
              <li><a routerLink="/wishlist">قائمة المقتنيات المفضلة</a></li>
              <li><a routerLink="/contact">فروع البوتيك وأرقام التواصل</a></li>
              <li><a routerLink="/admin/login">لوحة تحكم المسؤول (Demo Admin)</a></li>
            </ul>
          </div>

          <!-- Col 4: Boutique Branches -->
          <div class="footer-col">
            <h4 class="col-title">أبرز فروعنا</h4>
            <div class="branch-card">
              <h5>الرياض - برج المملكة</h5>
              <p>طريق الملك فهد، الطابق الأول - فاشن أفينيو</p>
            </div>
            <div class="branch-card">
              <h5>جدة - رد سي مول</h5>
              <p>طريق الملك عبد العزيز، البوابة رقم 4</p>
            </div>
            <div class="branch-card">
              <h5>دبي - دبي مول</h5>
              <p>الفاشن أفينيو، الطابق الأرضي</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="container bottom-content">
          <p class="copyright">
            © 2026 جميع الحقوق محفوظة لشركة أوبتيكا لاكشري للبصريات المحدودة | س.ت: 1010489230 | الرقم الضريبي: 300192847500003
          </p>

          <div class="payment-badges">
            <span class="pay-pill">مدى Mada</span>
            <span class="pay-pill">Apple Pay</span>
            <span class="pay-pill">Visa</span>
            <span class="pay-pill">Mastercard</span>
            <span class="pay-pill">تابي Tabby</span>
            <span class="pay-pill">تمارا Tamara</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background-color: var(--c-dark);
      color: #FFFFFF;
      margin-top: 5rem;
      border-top: 1px solid rgba(197, 168, 128, 0.2);
    }

    .footer-perks-bar {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2.5rem 0;
      background-color: #171717;
    }

    .perks-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    .perk-item {
      display: flex;
      align-items: center;
      gap: 1rem;

      .perk-icon-wrapper {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(197, 168, 128, 0.12);
        color: var(--c-gold);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .perk-text {
        h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 0.2rem;
        }
        p {
          font-size: 0.8rem;
          color: var(--c-muted-light);
          line-height: 1.4;
        }
      }
    }

    .footer-main {
      padding: 4.5rem 1.5rem 3.5rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
      gap: 3rem;
    }

    .footer-logo {
      display: flex;
      flex-direction: column;
      margin-bottom: 1.25rem;

      .logo-sub {
        font-size: 0.68rem;
        color: var(--c-gold);
        letter-spacing: 0.25em;
      }

      .logo-main {
        font-size: 1.6rem;
        font-weight: 800;
        color: #FFFFFF;
      }
    }

    .brand-desc {
      font-size: 0.9rem;
      color: var(--c-muted-light);
      line-height: 1.7;
      margin-bottom: 1.5rem;
      max-width: 380px;
    }

    .store-meta {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      .meta-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        font-size: 0.86rem;
        color: #D6D0C7;
      }
    }

    .col-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 1.5rem;
      position: relative;
      padding-bottom: 0.75rem;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 32px;
        height: 2px;
        background-color: var(--c-gold);
      }
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      li a {
        font-size: 0.9rem;
        color: var(--c-muted-light);
        transition: all 0.2s;

        &:hover {
          color: var(--c-gold);
          transform: translateX(-4px);
        }
      }
    }

    .branch-card {
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);

      h5 {
        color: #FFFFFF;
        font-size: 0.92rem;
        margin-bottom: 0.2rem;
      }

      p {
        font-size: 0.82rem;
        color: var(--c-muted-light);
      }
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1.5rem 0;
      background-color: #0E0E0E;
    }

    .bottom-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .copyright {
      font-size: 0.8rem;
      color: var(--c-muted);
    }

    .payment-badges {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;

      .pay-pill {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.25rem 0.6rem;
        border-radius: var(--radius-sm);
        font-size: 0.72rem;
        color: #E2DDD5;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    @media (max-width: 1024px) {
      .perks-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .footer-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .perks-grid {
        grid-template-columns: 1fr;
      }
      .footer-grid {
        grid-template-columns: 1fr;
      }
      .bottom-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}

