import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  templateUrl: './loading-state.component.html',
  styleUrls: ['./loading-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingStateComponent {}
