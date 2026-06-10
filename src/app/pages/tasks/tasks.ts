import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class Tasks implements OnInit {
  tasks: any[] = [];
  projects: any[] = [];
  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  taskForm: FormGroup;
  apiUrl = 'http://127.0.0.1:8000';

  // ✅ Toast
  toasts: Toast[] = [];
  private toastCounter = 0;

  // ✅ Confirm Delete
  showConfirmDialog = false;
  deletingTaskId: number | null = null;
  deletingTaskTitle = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['todo'],
      priority: ['medium'],
      project_id: ['', Validators.required],
      due_date: [null]
    });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTasks();
    this.loadProjects();
  }

  loadTasks() {
    const token = this.authService.getToken();
    this.http.get<any[]>(`${this.apiUrl}/tasks/?token=${token}`)
      .subscribe({
        next: (data) => {
          this.tasks = data;
          this.checkDueDateAlerts(data); // ✅ alerts check
          this.cdr.detectChanges();
        },
        error: () => this.showToast('Failed to load tasks!', 'error')
      });
  }

  loadProjects() {
    const token = this.authService.getToken();
    this.http.get<any[]>(`${this.apiUrl}/projects/?token=${token}`)
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.cdr.detectChanges();
        },
        error: () => this.showToast('Failed to load projects!', 'error')
      });
  }

  saveTask() {
    if (this.taskForm.valid) {
      const token = this.authService.getToken();
      const formData = { ...this.taskForm.value };
      if (!formData.due_date) formData.due_date = null;

      if (this.isEditing && this.editingId) {
        this.http.put(
          `${this.apiUrl}/tasks/${this.editingId}?token=${token}`,
          formData
        ).subscribe({
          next: () => {
            this.showToast('Task updated successfully! ✏️', 'success');
            this.loadTasks();
            this.cancelForm();
          },
          error: () => this.showToast('Failed to update task!', 'error')
        });
      } else {
        this.http.post(
          `${this.apiUrl}/tasks/?token=${token}`,
          formData
        ).subscribe({
          next: () => {
            this.showToast('Task created successfully! 🎉', 'success');
            this.loadTasks();
            this.cancelForm();
          },
          error: () => this.showToast('Failed to create task!', 'error')
        });
      }
    }
  }

  editTask(task: any) {
    this.isEditing = true;
    this.editingId = task.id;
    this.showForm = true;
    this.taskForm.patchValue({
      ...task,
      due_date: task.due_date ? task.due_date.split('T')[0] : null
    });
  }

  // ✅ Confirm Delete Open
  openDeleteDialog(task: any) {
    this.deletingTaskId = task.id;
    this.deletingTaskTitle = task.title;
    this.showConfirmDialog = true;
  }

  // ✅ Confirm Delete — Yes
  confirmDelete() {
    if (!this.deletingTaskId) return;
    const token = this.authService.getToken();
    this.http.delete(`${this.apiUrl}/tasks/${this.deletingTaskId}?token=${token}`)
      .subscribe({
        next: () => {
          this.showToast('Task deleted! 🗑️', 'success');
          this.loadTasks();
          this.closeDeleteDialog();
        },
        error: () => {
          this.showToast('Failed to delete task!', 'error');
          this.closeDeleteDialog();
        }
      });
  }

  // ✅ Confirm Delete — Cancel
  closeDeleteDialog() {
    this.showConfirmDialog = false;
    this.deletingTaskId = null;
    this.deletingTaskTitle = '';
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.taskForm.reset({ status: 'todo', priority: 'medium' });
  }

  getPriorityColor(priority: string): string {
    const colors: any = {
      low: 'primary',
      medium: 'accent',
      high: 'warn',
      critical: 'warn'
    };
    return colors[priority] || 'primary';
  }

  // ✅ Due Date Badge
  getDueBadge(task: any): { label: string, css: string } | null {
    if (!task.due_date || task.status === 'completed') return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.due_date);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0)   return { label: `🔴 ${Math.abs(diffDays)} days overdue!`, css: 'badge-overdue' };
    if (diffDays === 0) return { label: '🟡 Due Today!',                           css: 'badge-today'   };
    if (diffDays <= 3)  return { label: `🟠 ${diffDays} days left`,                css: 'badge-soon'    };
    return null;
  }

  // ✅ Due Date Toast Alerts
  checkDueDateAlerts(tasks: any[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
      if (!task.due_date || task.status === 'completed') return;

      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0)        this.showToast(`🔴 "${task.title}" overdue ஆகிவிட்டது!`, 'error');
      else if (diffDays === 0) this.showToast(`🟡 "${task.title}" — Today due date!`, 'warning');
      else if (diffDays <= 3)  this.showToast(`🟠 "${task.title}" — ${diffDays} days left!`, 'warning');
    });
  }

  // ✅ Toast Methods
  showToast(message: string, type: Toast['type'] = 'info') {
    const id = ++this.toastCounter;
    this.toasts.push({ id, message, type });
    this.cdr.detectChanges();
    setTimeout(() => this.removeToast(id), 3500);
  }

  removeToast(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}