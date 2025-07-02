import { Component, inject, signal } from '@angular/core';
import { EventBusService, HeroEvent } from '../../services/event-bus.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent {
  private eventBus = inject(EventBusService);
  private destroy$ = new Subject<void>();

  showToast = signal<boolean>(false);
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';

  ngOnInit(): void {
    this.listenToEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToEvents(): void {
    this.eventBus
      .on()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: HeroEvent) => {
        if (event.message) {
          this.showNotification(event.message, this.getToastType(event.type));
        }
      });
  }

  private getToastType(eventType: string): 'success' | 'error' | 'info' {
    switch (eventType) {
      case 'created':
      case 'updated':
      case 'deleted':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  public showNotification(
    message: string,
    type: 'success' | 'error' | 'info'
  ): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast.set(true);

    // Auto-hide después de 3 segundos
    setTimeout(() => {
      this.hideToast();
    }, 4000);
  }

  hideToast(): void {
    this.showToast.set(false);
  }
}
