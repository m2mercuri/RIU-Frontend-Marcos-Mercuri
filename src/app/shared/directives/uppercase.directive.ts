import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  private el = inject(ElementRef);

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const upperValue = value.toUpperCase();

    if (value !== upperValue) {
      input.value = upperValue;

      // Disparar evento de input para que Angular detecte el cambio
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();

    // Disparar evento de blur para que Angular detecte el cambio
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }
}
