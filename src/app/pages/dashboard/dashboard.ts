import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth';

interface DueAlert {
  taskTitle: string;
  type: 'overdue' | 'today' | 'soon';
  daysLeft: number;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  stats = {
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  };

  // ✅ Notification Bell
  alerts: DueAlert[] = [];
  showNotifications = false;

  get unreadCount(): number {
    return this.alerts.length;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadStats();
  }

  loadStats() {
    const token = this.authService.getToken();
    if (!token) return;

    this.http.get<any[]>(`http://127.0.0.1:8000/projects/?token=${token}`)
      .subscribe((projects) => {
        this.stats.totalProjects = projects.length;
        this.cdr.detectChanges();
      });

    this.http.get<any[]>(`http://127.0.0.1:8000/tasks/?token=${token}`)
      .subscribe((tasks) => {
        this.stats.totalTasks = tasks.length;
        this.stats.completedTasks = tasks.filter(t => t.status === 'completed').length;
        this.stats.pendingTasks = tasks.filter(t => t.status !== 'completed').length;
        this.checkDueAlerts(tasks); // ✅ alerts check
        this.cdr.detectChanges();
      });
  }

  // ✅ Due Date Alert Logic
  checkDueAlerts(tasks: any[]) {
    this.alerts = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      if (!task.due_date || task.status === 'completed') return;

      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        this.alerts.push({
          taskTitle: task.title,
          type: 'overdue',
          daysLeft: diffDays,
          label: `${Math.abs(diffDays)} days overdue!`
        });
      } else if (diffDays === 0) {
        this.alerts.push({
          taskTitle: task.title,
          type: 'today',
          daysLeft: 0,
          label: 'Due Today!'
        });
      } else if (diffDays <= 3) {
        this.alerts.push({
          taskTitle: task.title,
          type: 'soon',
          daysLeft: diffDays,
          label: `${diffDays} days left`
        });
      }
    });

    this.cdr.detectChanges();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}