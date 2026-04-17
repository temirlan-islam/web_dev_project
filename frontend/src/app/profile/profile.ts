import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { TaskService, Task } from '../services/task';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  username = '';
  avatarUrl: string | null = null;
  taskCount = 0;
  doneCount = 0;
  highCount = 0;
  streakDays = 0;
  joinDate = 'Jan 2026';
  newUsername = '';
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  successMsg = '';
  errorMsg = '';
  tasks: Task[] = [];
  activeTab = 'overview';
  isLoaded = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'User';
    this.avatarUrl = localStorage.getItem('avatarUrl') || null;

    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        this.tasks = tasks;
        this.taskCount = tasks.length;
        this.doneCount = tasks.filter(t => t.status).length;
        this.highCount = tasks.filter(t => t.priority === 'high').length;
        this.streakDays = this.calcStreak(tasks);
        this.isLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoaded = true;
        this.cdr.detectChanges();
      }
    });

    this.http.get<any>('http://127.0.0.1:8000/api/profile/').subscribe({
      next: (data) => {
        if (data && data.user) {
          this.username = data.user.username;
          localStorage.setItem('username', data.user.username);
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  get progressPercent(): number {
    return this.taskCount > 0 ? Math.round(this.doneCount / this.taskCount * 100) : 0;
  }

  get recentDone(): Task[] { return this.tasks.filter(t => t.status).slice(-5).reverse(); }
  get pendingTasks(): Task[] { return this.tasks.filter(t => !t.status).slice(0, 5); }

  calcStreak(tasks: Task[]): number {
    const done = tasks.filter(t => t.status && t.created_at);
    if (done.length === 0) return 0;
    const dates = new Set(done.map(t => t.created_at!.substring(0, 10)));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const key = d.toISOString().substring(0, 10);
      if (dates.has(key)) { streak++; } else if (i > 0) { break; }
    }
    return streak;
  }

  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 500000) { alert('Max 500KB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = reader.result as string;
      localStorage.setItem('avatarUrl', this.avatarUrl);
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  removeAvatar() {
    this.avatarUrl = null;
    localStorage.removeItem('avatarUrl');
    this.cdr.detectChanges();
  }

  setTab(tab: string) { this.activeTab = tab; }

  changePassword() {
    this.successMsg = ''; this.errorMsg = '';
    if (this.newPassword !== this.confirmPassword) { this.errorMsg = 'Passwords do not match'; return; }
    if (this.newPassword.length < 4) { this.errorMsg = 'Min 4 characters'; return; }
    this.http.post<any>('http://127.0.0.1:8000/api/change-password/', {
      old_password: this.oldPassword, new_password: this.newPassword
    }).subscribe({
      next: (r) => { this.successMsg = r.message || 'Password changed!'; this.oldPassword=''; this.newPassword=''; this.confirmPassword=''; this.cdr.detectChanges(); },
      error: (e) => { this.errorMsg = e.error?.error || 'Failed'; this.cdr.detectChanges(); }
    });
  }

  changeUsername() {
    this.successMsg = ''; this.errorMsg = '';
    if (!this.newUsername.trim()) { this.errorMsg = 'Enter a username'; return; }
    if (this.newUsername.trim().length < 2) { this.errorMsg = 'Min 2 characters'; return; }
    this.http.post<any>('http://127.0.0.1:8000/api/change-username/', {
      username: this.newUsername.trim()
    }).subscribe({
      next: (r) => {
        this.username = r.username;
        localStorage.setItem('username', r.username);
        this.newUsername = '';
        this.successMsg = r.message || 'Username updated!';
        this.cdr.detectChanges();
      },
      error: (e) => { this.errorMsg = e.error?.error || 'Failed'; this.cdr.detectChanges(); }
    });
  }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}
