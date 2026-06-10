import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { LoadingService } from '../../services/loading';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  template: `
    @if (isLoading$ | async) {
      <div class="spinner-overlay">
        <div class="spinner-ring">
          <div></div><div></div><div></div><div></div>
        </div>
        <p class="spinner-text">Loading...</p>
      </div>
    }
  `,
  styles: [`
    .spinner-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(3px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.2s ease;
    }
    .spinner-ring {
      width: 56px;
      height: 56px;
      position: relative;
    }
    .spinner-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 48px;
      height: 48px;
      margin: 4px;
      border: 4px solid transparent;
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .spinner-ring div:nth-child(1) { animation-delay: -0.3s; }
    .spinner-ring div:nth-child(2) { animation-delay: -0.2s; }
    .spinner-ring div:nth-child(3) { animation-delay: -0.1s; }
    .spinner-text {
      color: #a5b4fc;
      margin-top: 16px;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 1px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class SpinnerComponent {
  // ✅ Fix — constructor first, then initialize
  isLoading$;

  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.isLoading$;
  }
}