import { Directive, ElementRef, Input, inject } from '@angular/core';

@Directive({
  selector: 'button[icon]',
  standalone: true,
})
export class IconButtonDirective {
  private el = inject(ElementRef);

  @Input() set icon(iconClassList: string) {
    if (iconClassList.length === 0) {
      return;
    }
    const button = this.el.nativeElement as HTMLButtonElement;
    button.classList.add('btn-icon');
    const icon = document.createElement('i');
    icon.classList.add(...iconClassList.split(' '));
    button.appendChild(icon);
  }

  constructor() {}
}
