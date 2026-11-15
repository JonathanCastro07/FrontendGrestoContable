import { Component } from '@angular/core';
import { ToastService } from '../../services/ToastService';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
