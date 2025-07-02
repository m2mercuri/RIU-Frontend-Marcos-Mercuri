import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loading = signal<boolean>(false);
  private loadingCount = 0;

  show(): void {
    this.loadingCount++;
    this.loading.set(true);
  }

  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.loading.set(false);
    }
  }

  get isLoading() {
    return this.loading.asReadonly();
  }

  reset(): void {
    this.loadingCount = 0;
    this.loading.set(false);
  }
}
