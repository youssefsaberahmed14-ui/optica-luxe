import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="contact-page">
      <!-- Header -->
      <section class="contact-header">
        <div class="container">
          <nav class="breadcrumb-nav">
            <a routerLink="/">الرئيسية</a>
            <span class="sep">/</span>
            <span class="current">الفروع وتواصل معنا</span>
          </nav>
          <div class="header-text">
            <h1 class="page-title">صالات العرض والخدمة الفاخرة</h1>
            <p class="page-subtitle">
              يسعدنا الترحيب بكم في بوتيكات أوبتيكا لاكشري لتقديم تجربة بصرية ملكية واستشارات فحص النظر المتطورة
            </p>
          </div>
        </div>
      </section>

      <div class="container contact-body">
        <!-- Quick Contact Bar -->
        <div class="quick-contact-cards">
          <div class="q-card">
            <div class="q-icon">
              <app-icon name="phone" [size]="22"></app-icon>
            </div>
            <div class="q-info">
              <h4>الرقم الموحد المجاني</h4>
              <p dir="ltr">800-800-LUXE (5893)</p>
              <span class="sub">متاح يومياً من 9 ص حتى 11 م</span>
            </div>
          </div>

          <a href="https://wa.me/966500000000" target="_blank" rel="noopener" class="q-card whatsapp-card">
            <div class="q-icon whatsapp-icon">
              <app-icon name="whatsapp" [size]="22"></app-icon>
            </div>
            <div class="q-info">
              <h4>المساعد الشخصي عبر واتساب</h4>
              <p dir="ltr">+966 50 123 4567</p>
              <span class="sub">رد فوري واستشارات بصرية</span>
            </div>
          </a>

          <div class="q-card">
            <div class="q-icon">
              <app-icon name="mail" [size]="22"></app-icon>
            </div>
            <div class="q-info">
              <h4>البريد الإلكتروني للكونسيرج</h4>
              <p dir="ltr">concierge&#64;optica-luxe.com</p>
              <span class="sub">استفسارات الشراء والطلبات الخاصة</span>
            </div>
          </div>
        </div>

        <div class="contact-main-grid">
          <!-- Form: Inquiries & Eye Exam Booking -->
          <div class="form-wrapper">
            <div class="form-header">
              <span class="section-tag">تواصل معنا أو احجز موعداً</span>
              <h2 class="form-title">إرسال استفسار أو حجز فحص نظر</h2>
              <p class="form-subtitle">يرجى ملء النموذج أدناه وسيقوم أخصائي البصريات بالاتصال بك خلال ساعة لتأكيد موعدك.</p>
            </div>

            @if (formSubmitted()) {
              <div class="form-success-banner animate-fade-in">
                <app-icon name="check" [size]="24" class="gold-icon"></app-icon>
                <div>
                  <h4>تم استلام رسالتك بنجاح!</h4>
                  <p>شكراً لتواصلك معنا يا {{ contactData.name }}. سيتصل بك فريق الكونسيرج البصري قريباً جداً.</p>
                </div>
              </div>
            }

            <form (submit)="onSubmit($event)" class="contact-form">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">الاسم الكريم *</label>
                  <input
                    type="text"
                    [(ngModel)]="contactData.name"
                    name="name"
                    class="form-input"
                    placeholder="مثال: فيصل بن عبد الرحمن"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">رقم الجوال *</label>
                  <input
                    type="tel"
                    [(ngModel)]="contactData.phone"
                    name="phone"
                    class="form-input"
                    placeholder="05XXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    [(ngModel)]="contactData.email"
                    name="email"
                    class="form-input"
                    placeholder="email@domain.com"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">الفرع المفضل لزيارتك *</label>
                  <select
                    [(ngModel)]="contactData.branch"
                    name="branch"
                    class="form-select"
                    required
                  >
                    <option value="الرياض - برج المملكة">الرياض - برج المملكة</option>
                    <option value="جدة - رد سي مول">جدة - رد سي مول</option>
                    <option value="دبي - دبي مول">دبي - دبي مول</option>
                    <option value="القاهرة - سيتي ستارز">القاهرة - سيتي ستارز</option>
                    <option value="استشارة رقمية عن بُعد">استشارة رقمية عن بُعد</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">نوع الطلب أو الاستفسار *</label>
                <select
                  [(ngModel)]="contactData.inquiryType"
                  name="inquiryType"
                  class="form-select"
                  required
                >
                  <option value="حجز فحص نظر سريري متقدم">حجز فحص نظر سريري متقدم (مجاني)</option>
                  <option value="استفسار عن توفر موديل أو ماركة معينة">استفسار عن توفر موديل أو ماركة معينة</option>
                  <option value="صيانة أو ضبط نظارة وإطار">صيانة أو ضبط نظارة وإطار</option>
                  <option value="تفصيل عدسات شمسية أو طبية مخصصة">تفصيل عدسات شمسية أو طبية مخصصة</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">رسالتك أو ملاحظاتك *</label>
                <textarea
                  [(ngModel)]="contactData.message"
                  name="message"
                  rows="4"
                  class="form-textarea"
                  placeholder="اكتب أي تفاصيل بصرية تود مشاركتها معنا أو موعد الزيارة المفضل..."
                  required
                ></textarea>
              </div>

              <button type="submit" class="btn btn-gold btn-lg w-100">
                <span>إرسال الرسالة وتأكيد الموعد</span>
                <app-icon name="arrow-left" [size]="18"></app-icon>
              </button>
            </form>
          </div>

          <!-- Boutiques & Locations List -->
          <div class="locations-wrapper">
            <h3 class="locations-title">عناوين صالات العرض وساعات العمل</h3>

            <div class="branches-cards-stack">
              <!-- Branch 1 -->
              <div class="branch-item-card">
                <div class="b-header">
                  <app-icon name="map-pin" [size]="20" class="gold-icon"></app-icon>
                  <h4>بوتيك الرياض - برج المملكة</h4>
                  <span class="b-status open">مفتوح الآن</span>
                </div>
                <p class="b-address">طريق الملك فهد، الطابق الأول - فاشن أفينيو، مقابل رولكس</p>
                <div class="b-meta">
                  <div class="meta-row">
                    <app-icon name="clock" [size]="15"></app-icon>
                    <span>السبت - الخميس: 10:00 ص - 11:00 م | الجمعة: 2:00 م - 11:30 م</span>
                  </div>
                  <div class="meta-row">
                    <app-icon name="phone" [size]="15"></app-icon>
                    <span dir="ltr">+966 11 482 9900</span>
                  </div>
                </div>
              </div>

              <!-- Branch 2 -->
              <div class="branch-item-card">
                <div class="b-header">
                  <app-icon name="map-pin" [size]="20" class="gold-icon"></app-icon>
                  <h4>بوتيك جدة - رد سي مول</h4>
                  <span class="b-status open">مفتوح الآن</span>
                </div>
                <p class="b-address">طريق الملك عبد العزيز، البوابة رقم 4، الطابق الأرضي</p>
                <div class="b-meta">
                  <div class="meta-row">
                    <app-icon name="clock" [size]="15"></app-icon>
                    <span>السبت - الخميس: 10:00 ص - 11:00 م | الجمعة: 2:00 م - 11:30 م</span>
                  </div>
                  <div class="meta-row">
                    <app-icon name="phone" [size]="15"></app-icon>
                    <span dir="ltr">+966 12 692 8811</span>
                  </div>
                </div>
              </div>

              <!-- Branch 3 -->
              <div class="branch-item-card">
                <div class="b-header">
                  <app-icon name="map-pin" [size]="20" class="gold-icon"></app-icon>
                  <h4>بوتيك دبي - دبي مول</h4>
                  <span class="b-status open">مفتوح الآن</span>
                </div>
                <p class="b-address">الفاشن أفينيو، الطابق الأرضي، بجوار بوتيك كارتييه</p>
                <div class="b-meta">
                  <div class="meta-row">
                    <app-icon name="clock" [size]="15"></app-icon>
                    <span>يومياً: 10:00 ص - 12:00 منتصف الليل</span>
                  </div>
                  <div class="meta-row">
                    <app-icon name="phone" [size]="15"></app-icon>
                    <span dir="ltr">+971 4 330 7744</span>
                  </div>
                </div>
              </div>

              <!-- Branch 4 -->
              <div class="branch-item-card">
                <div class="b-header">
                  <app-icon name="map-pin" [size]="20" class="gold-icon"></app-icon>
                  <h4>بوتيك القاهرة - سيتي ستارز</h4>
                  <span class="b-status open">مفتوح الآن</span>
                </div>
                <p class="b-address">مدينة نصر، المرحلة الأولى، الطابق الثاني</p>
                <div class="b-meta">
                  <div class="meta-row">
                    <app-icon name="clock" [size]="15"></app-icon>
                    <span>يومياً: 10:00 ص - 11:00 م</span>
                  </div>
                  <div class="meta-row">
                    <app-icon name="phone" [size]="15"></app-icon>
                    <span dir="ltr">+20 2 2480 3300</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-header {
      background-color: var(--c-surface-soft);
      border-bottom: 1px solid var(--c-border);
      padding: 2.5rem 0;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--c-muted);
      margin-bottom: 0.75rem;

      a {
        color: var(--c-dark-secondary);
        &:hover { color: var(--c-gold-hover); }
      }

      .current {
        color: var(--c-dark);
        font-weight: 700;
      }
    }

    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--c-dark);
      margin-bottom: 0.35rem;
    }

    .page-subtitle {
      font-size: 1rem;
      color: var(--c-muted);
    }

    .contact-body {
      padding: 3.5rem 1.5rem;
    }

    /* Quick cards */
    .quick-contact-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 3.5rem;
    }

    .q-card {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 1.75rem;
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      transition: all var(--transition-smooth);

      &:hover {
        border-color: var(--c-gold);
        box-shadow: var(--shadow-hover);
        transform: translateY(-3px);
      }

      &.whatsapp-card {
        border-color: rgba(37, 211, 102, 0.4);
        background: linear-gradient(135deg, #FFFFFF 0%, #F5FFF8 100%);
      }

      .q-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: var(--c-gold-light);
        color: var(--c-gold-dark);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        &.whatsapp-icon {
          background-color: #E8F8EE;
          color: #25D366;
        }
      }

      .q-info {
        h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }

        p {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--c-dark);
          margin-bottom: 0.2rem;
        }

        .sub {
          font-size: 0.78rem;
          color: var(--c-muted);
        }
      }
    }

    /* Main Grid */
    .contact-main-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 3.5rem;
      align-items: start;
    }

    .form-wrapper {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 2.5rem;
    }

    .form-header {
      margin-bottom: 2rem;

      .section-tag {
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--c-gold-dark);
        letter-spacing: 0.1em;
        text-transform: uppercase;
        margin-bottom: 0.4rem;
        display: block;
      }

      .form-title {
        font-size: 1.8rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
      }

      .form-subtitle {
        font-size: 0.92rem;
        color: var(--c-muted);
        line-height: 1.6;
      }
    }

    .form-success-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background-color: var(--c-gold-light);
      border: 1px solid rgba(197, 168, 128, 0.4);
      border-radius: var(--radius-sm);
      margin-bottom: 1.75rem;

      h4 {
        font-size: 1rem;
        color: var(--c-gold-dark);
        margin-bottom: 0.2rem;
      }

      p {
        font-size: 0.88rem;
        color: var(--c-dark-secondary);
      }
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    /* Locations column */
    .locations-wrapper {
      display: flex;
      flex-direction: column;

      .locations-title {
        font-size: 1.4rem;
        font-weight: 800;
        margin-bottom: 1.5rem;
      }
    }

    .branches-cards-stack {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .branch-item-card {
      background: #FFFFFF;
      border: 1px solid var(--c-border);
      border-radius: var(--radius-sm);
      padding: 1.5rem;
      transition: all var(--transition-smooth);

      &:hover {
        border-color: var(--c-gold);
        box-shadow: var(--shadow-subtle);
        transform: translateX(-3px);
      }

      .b-header {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        margin-bottom: 0.5rem;

        h4 {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .b-status {
          margin-right: auto;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);

          &.open {
            background-color: #E8F5E9;
            color: #2E7D32;
          }
        }
      }

      .b-address {
        font-size: 0.88rem;
        color: var(--c-muted);
        margin-bottom: 1rem;
        line-height: 1.5;
      }

      .b-meta {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        padding-top: 0.75rem;
        border-top: 1px solid var(--c-border-light);

        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--c-dark-secondary);
        }
      }
    }

    .gold-icon {
      color: var(--c-gold);
    }

    .w-100 {
      width: 100%;
    }

    @media (max-width: 1024px) {
      .quick-contact-cards {
        grid-template-columns: 1fr;
      }
      .contact-main-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .form-row-2 {
        grid-template-columns: 1fr;
      }
      .form-wrapper {
        padding: 1.5rem;
      }
    }
  `]
})
export class ContactComponent {
  private notificationService = inject(NotificationService);

  formSubmitted = signal<boolean>(false);

  contactData = {
    name: '',
    phone: '',
    email: '',
    branch: 'الرياض - برج المملكة',
    inquiryType: 'حجز فحص نظر سريري متقدم',
    message: '',
  };

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.contactData.name || !this.contactData.phone || !this.contactData.message) {
      this.notificationService.warning('يرجى تعبئة كافة الحقول المطلوبة');
      return;
    }

    this.formSubmitted.set(true);
    this.notificationService.success(
      `تم استلام طلبك يا ${this.contactData.name} بنجاح. سيتواصل معك كونسيرج أوبتيكا لاكشري قريباً!`,
      'تم الإرسال بنجاح'
    );
  }
}

