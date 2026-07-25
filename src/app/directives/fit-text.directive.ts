import { Directive, DestroyRef, ElementRef, afterRenderEffect, inject, input, signal } from '@angular/core';

/**
 * Sizes the host element's font so its (wrapped) text fills its parent's box
 * as much as possible without overflowing — a binary-search "shrink/grow to
 * fit" against the actual rendered box, rather than an estimate based on
 * character count. Re-measures whenever `appFitText`'s value changes or the
 * parent is resized (e.g. orientation change).
 */
@Directive({
  selector: '[appFitText]',
  standalone: true,
})
export class FitTextDirective {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  readonly appFitText = input<string>('');
  readonly maxFontSize = input(64);
  readonly minFontSize = input(12);

  private readonly resizeTick = signal(0);

  constructor() {
    const resizeObserver = new ResizeObserver(() => this.resizeTick.update((v) => v + 1));
    const container = this.elementRef.nativeElement.parentElement;
    if (container) {
      resizeObserver.observe(container);
    }
    this.destroyRef.onDestroy(() => resizeObserver.disconnect());

    afterRenderEffect(() => {
      this.appFitText();
      this.resizeTick();
      this.fit();
    });
  }

  private fit(): void {
    const el = this.elementRef.nativeElement;
    const container = el.parentElement;
    if (!container) return;

    const availableWidth = container.clientWidth;
    const availableHeight = container.clientHeight;
    if (availableWidth <= 0 || availableHeight <= 0) return;

    let lo = this.minFontSize();
    let hi = this.maxFontSize();
    let best = lo;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      el.style.fontSize = `${mid}px`;
      const fits = el.scrollHeight <= availableHeight && el.scrollWidth <= availableWidth;
      if (fits) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    el.style.fontSize = `${best}px`;
  }
}
