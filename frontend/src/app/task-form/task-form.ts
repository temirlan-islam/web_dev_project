import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService, Task, Category } from '../services/task';

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.html',
  styleUrls: ['./task-form.css']
})
export class TaskForm implements OnInit {
  task: Task = { title: '', description: '', status: false, priority: 'medium', due_date: null, category: null };
  id: number | null = null;
  categories: Category[] = [];
  minDate = '';
  maxDate = '';

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const now = new Date();
    this.minDate = now.toISOString().substring(0, 10);
    const max = new Date(now.getFullYear() + 2, 11, 31);
    this.maxDate = max.toISOString().substring(0, 10);

    this.taskService.getCategories().subscribe({
      next: (cats) => { this.categories = cats; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.id = Number(this.route.snapshot.params['id']) || null;
    if (this.id) {
      this.taskService.getTask(this.id).subscribe({
        next: (task) => {
          this.task = task;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Load task error:', err);
          this.router.navigate(['/tasks']);
        }
      });
    }
  }

  setDate(offset: number) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    this.task.due_date = d.toISOString().substring(0, 10);
  }

  clearDate() {
    this.task.due_date = null;
  }

  get isDateToday(): boolean {
    return this.task.due_date === new Date().toISOString().substring(0, 10);
  }

  get isDateTomorrow(): boolean {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return this.task.due_date === d.toISOString().substring(0, 10);
  }

  get isDateNextWeek(): boolean {
    const d = new Date(); d.setDate(d.getDate() + 7);
    return this.task.due_date === d.toISOString().substring(0, 10);
  }

  save() {
    if (this.id) {
      this.taskService.updateTask(this.id, this.task).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => {
          console.error('Update error:', err);
          alert('Error updating task');
        }
      });
    } else {
      this.taskService.createTask(this.task).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => {
          console.error('Create error:', err);
          alert('Error creating task');
        }
      });
    }
  }
}
