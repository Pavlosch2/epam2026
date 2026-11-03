import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, signal, computed, effect, inject, HostListener } from '@angular/core';
import { Roles } from '@app/shared/constants/roles';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserModel } from '@app/auth/models/user.model';
import { AuthenticationService } from '@app/auth/services/authentication.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { NotificationsService } from '@app/services/notifications/notifications.service';
import { Notification } from '@app/models/notifications/notification.model';
import { CartComponent } from '@app/components/cart/cart.component';
import { GuestPreorderStore } from '@app/pages/guest-pre-order-page/state/guest-preorder.store';
import { FoodRouletteComponent } from '../food-roulette/food-roulette.component';
import { VipMenuComponent } from '../vip-menu/vip-menu.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, AsyncPipe, CartComponent, CommonModule, FoodRouletteComponent, VipMenuComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly POLLING_INTERVAL = 60000; // 60 sec
  private isDestroyed = false;

  protected readonly Roles = Roles;

  user = signal<UserModel | null>(null);
  notifications = signal<Notification[]>([]);
  unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);

  // UI signals
  showDropdown = signal(false);
  showNotificationsDropdown = signal(false);
  isMobileMenuOpen = signal(false);
  showCart = signal(false);

  // SIGNALS ДЛЯ СЕКРЕТНИХ ФІЧ
  isVipMode = signal(false);
  isRouletteOpen = signal(false);
  isVipMenuOpen = signal(false);

  private logoTapCount = 0;
  private logoTapTimer?: any;

  private readonly konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  private konamiIndex = 0;

  private pollingSubscription?: Subscription;
  private userSubscription?: Subscription;

  protected readonly authService = inject(AuthenticationService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly router = inject(Router);
  private readonly guestPreorderStore = inject(GuestPreorderStore);

  get isGuestPreorderRoute(): boolean {
    return this.router.url.startsWith('/join/');
  }

  get isSubmittedGuestPreorder(): boolean {
    return this.isGuestPreorderRoute && this.guestPreorderStore.status() === 'submitted';
  }

  constructor() {
    effect(() => {
      const u = this.user();
      if (u?.role === Roles.WAITER) {
        this.startNotificationsPolling();
      } else {
        this.stopNotificationsPolling();
        this.notifications.set([]);
      }
    });
  }

  ngOnInit() {
    this.userSubscription = this.authService.user$.subscribe((u) => this.user.set(u));
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.stopNotificationsPolling();
    this.userSubscription?.unsubscribe();
    if (this.logoTapTimer) {
      clearTimeout(this.logoTapTimer);
    }
  }

  // 🎰 ЛОГІКА 5 КЛІКІВ ТА KONAMI CODE
  onLogoClick(): void {
    this.logoTapCount++;

    if (this.logoTapTimer) {
      clearTimeout(this.logoTapTimer);
    }

    this.logoTapTimer = setTimeout(() => {
      this.logoTapCount = 0;
    }, 1500);

    if (this.logoTapCount >= 5) {
      this.toggleVipMode();
      this.logoTapCount = 0;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === this.konamiSequence[this.konamiIndex].toLowerCase()) {
      this.konamiIndex++;
      if (this.konamiIndex === this.konamiSequence.length) {
        this.toggleVipMode();
        this.konamiIndex = 0;
      }
    } else {
      this.konamiIndex = 0;
    }
  }

  toggleVipMode(): void {
    this.isVipMode.update((v) => !v);
    document.body.classList.toggle('cyberpunk-theme', this.isVipMode());

    if (this.isVipMode()) {
      this.isVipMenuOpen.set(true);
    }
  }

  toggleRoulette(): void {
    this.isRouletteOpen.update((v) => !v);
  }

  closeRoulette(): void {
    this.isRouletteOpen.set(false);
  }

  startNotificationsPolling() {
    if (this.isDestroyed || this.pollingSubscription) return;

    setTimeout(() => this.loadNotifications(), 100);

    this.pollingSubscription = interval(this.POLLING_INTERVAL).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => {
        console.error('Polling error', err);
        this.stopNotificationsPolling();
      },
    });
  }

  stopNotificationsPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  loadNotifications() {
    this.notificationsService.loadNotifications().subscribe({
      next: (notifications) => this.notifications.set(notifications),
      error: (error) => console.error('Failed to load notifications', error),
    });
  }

  openDropdown(): void { this.showDropdown.set(true); }
  closeDropdown(): void { this.showDropdown.set(false); }

  onDropdownFocusOut(event: FocusEvent): void {
    const wrapper = event.currentTarget as HTMLElement;
    const nextFocusedElement = event.relatedTarget as Node | null;
    if (nextFocusedElement && wrapper.contains(nextFocusedElement)) return;
    this.closeDropdown();
  }

  toggleMobileMenu(): void { this.isMobileMenuOpen.update((v) => !v); }
  closeMobileMenu(): void { this.isMobileMenuOpen.set(false); }

  logout(event?: Event): void {
    event?.stopPropagation();
    this.authService.signOut();
    this.closeDropdown();
    this.closeMobileMenu();
    this.closeNotificationsDropdown();
    this.showCart.set(false);
    void this.router.navigate(['/main']);
  }

  toggleNotificationsDropdown(): void { this.showNotificationsDropdown.update((v) => !v); }
  closeNotificationsDropdown(): void { this.showNotificationsDropdown.set(false); }

  markNotificationAsRead(notificationId: string): void {
    this.notificationsService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
        );
      },
      error: (err) => console.error('Failed to mark notification as read', err),
    });
  }

  toggleCart(): void { this.showCart.update((v) => !v); }
}