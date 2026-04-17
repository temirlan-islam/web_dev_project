import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { TaskService, Task } from '../services/task';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: false,
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskList implements OnInit {
  tasks: Task[] = [];
  errorMessage = '';
  isLoading = true;
  filter: 'all' | 'pending' | 'done' = 'all';
  searchTerm = '';
  sortBy: 'created' | 'title' | 'priority' | 'due' = 'created';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  get filteredTasks(): Task[] {
    let result = [...this.tasks];
    if (this.filter === 'pending') result = result.filter(t => !t.status);
    if (this.filter === 'done') result = result.filter(t => t.status);
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(t =>
        t.title.toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term)
      );
    }
    const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    if (this.sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.sortBy === 'priority') {
      result.sort((a, b) => (priorityOrder[b.priority || 'medium'] || 2) - (priorityOrder[a.priority || 'medium'] || 2));
    } else if (this.sortBy === 'due') {
      result.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return a.due_date.localeCompare(b.due_date);
      });
    } else {
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
    return result;
  }

  setSort(s: 'created' | 'title' | 'priority' | 'due') {
    this.sortBy = s;
    this.cdr.detectChanges();
  }

  isOverdue(task: Task): boolean {
    if (!task.due_date || task.status) return false;
    return new Date(task.due_date) < new Date(new Date().toDateString());
  }

  get totalCount(): number { return this.tasks.length; }
  get pendingCount(): number { return this.tasks.filter(t => !t.status).length; }
  get doneCount(): number { return this.tasks.filter(t => t.status).length; }

  setFilter(f: 'all' | 'pending' | 'done') {
    this.filter = f;
    this.cdr.detectChanges();
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.ngZone.run(() => {
          this.tasks = tasks;
          this.errorMessage = '';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          console.error('Failed to load tasks', err);
          this.errorMessage = 'Failed to load tasks. Please login again.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  toggleStatus(task: Task) {
    task.status = !task.status;
    this.taskService.updateTask(task.id!, task).subscribe(() => this.loadTasks());
  }

  deleteTask(id: number) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    this.taskService.deleteTask(id).subscribe(() => this.loadTasks());
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}