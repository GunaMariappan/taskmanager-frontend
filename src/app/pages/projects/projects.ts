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
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../shared/toast';

@Component({
  selector: 'app-projects',
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
    MatDialogModule
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class Projects implements OnInit {
  projects: any[] = [];
  showForm = false;
  isEditing = false;
  editingId: number | null = null;
  isLoading = false;
  deleteConfirmId: number | null = null;
  projectForm: FormGroup;
  apiUrl = 'https://taskmanager-backend-xkb1.onrender.com';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['planning']
    });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProjects();
  }

  loadProjects() {
    const token = this.authService.getToken();
    this.isLoading = true;
    this.http.get<any[]>(`${this.apiUrl}/projects/?token=${token}`)
      .subscribe({
        next: (data) => {
          this.projects = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.toast.error('Failed to load projects!');
          this.isLoading = false;
        }
      });
  }

  saveProject() {
    if (this.projectForm.valid) {
      const token = this.authService.getToken();
      if (this.isEditing && this.editingId) {
        this.http.put(
          `${this.apiUrl}/projects/${this.editingId}?token=${token}`,
          this.projectForm.value
        ).subscribe({
          next: () => {
            this.toast.success('Project updated successfully! ✅');
            this.loadProjects();
            this.cancelForm();
          },
          error: () => this.toast.error('Failed to update project!')
        });
      } else {
        this.http.post(
          `${this.apiUrl}/projects/?token=${token}`,
          this.projectForm.value
        ).subscribe({
          next: () => {
            this.toast.success('Project created successfully! 🎉');
            this.loadProjects();
            this.cancelForm();
          },
          error: () => this.toast.error('Failed to create project!')
        });
      }
    }
  }

  editProject(project: any) {
    this.isEditing = true;
    this.editingId = project.id;
    this.showForm = true;
    this.projectForm.patchValue(project);
  }

  confirmDelete(id: number) {
    this.deleteConfirmId = id;
  }

  deleteProject() {
    if (!this.deleteConfirmId) return;
    const token = this.authService.getToken();
    this.http.delete(`${this.apiUrl}/projects/${this.deleteConfirmId}?token=${token}`)
      .subscribe({
        next: () => {
          this.toast.success('Project deleted! 🗑️');
          this.deleteConfirmId = null;
          this.loadProjects();
        },
        error: () => this.toast.error('Failed to delete project!')
      });
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  cancelForm() {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.projectForm.reset({ status: 'planning' });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
