import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../toast';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toasts.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  remove(id: number) {
    this.toastService.remove(id);
  }

  getIcon(type: string): string {
    const icons: any = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type] || 'info';
  }
}