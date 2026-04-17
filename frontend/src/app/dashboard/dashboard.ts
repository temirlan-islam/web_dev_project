import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { TaskService, Task } from '../services/task';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  tasks: Task[] = [];
  username = '';
  avatarUrl: string | null = null;
  isLoading = true;
  searchQuery = '';
  greeting = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  get totalCount(): number { return this.tasks.length; }
  get pendingCount(): number { return this.tasks.filter(t => !t.status).length; }
  get doneCount(): number { return this.tasks.filter(t => t.status).length; }
  get progressPercent(): number { return this.totalCount > 0 ? Math.round(this.doneCount / this.totalCount * 100) : 0; }
  get pendingSlice(): Task[] { return this.tasks.filter(t => !t.status).slice(0, 4); }
  get recentTasks(): Task[] { return [...this.tasks].slice(-6).reverse(); }
  get overdueTasks(): Task[] {
    const today = new Date().toISOString().substring(0, 10);
    return this.tasks.filter(t => !t.status && t.due_date && t.due_date < today);
  }
  get todayDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  getTimeEstimate(task: Task): string {
    const t = (task.title + ' ' + (task.description || '')).toLowerCase();
    if (t.match(/clean|wash|laundry|dishes|mop|sweep|vacuum|уборк|помы|постир|пылесос/)) return '30-60 min';
    if (t.match(/cook|dinner|lunch|breakfast|meal|готов|обед|ужин|завтрак/)) return '45-90 min';
    if (t.match(/study|learn|read|homework|essay|exam|учи|читать|домашн|экзамен|подготов/)) return '1-3 hours';
    if (t.match(/work|project|report|presentation|работ|проект|отчёт|презентац/)) return '2-4 hours';
    if (t.match(/exercise|gym|run|workout|sport|тренир|спорт|бег|зал/)) return '30-60 min';
    if (t.match(/shop|buy|store|grocery|market|магазин|купить|покупк/)) return '30-60 min';
    if (t.match(/call|email|message|write|send|звон|письм|написа|отправ/)) return '10-20 min';
    if (t.match(/fix|repair|install|setup|почин|ремонт|установ|настро/)) return '1-2 hours';
    if (t.match(/meet|meeting|appointment|встреч|собран/)) return '30-60 min';
    if (t.match(/play|game|movie|watch|игр|кино|смотре|фильм/)) return '1-2 hours';
    if (t.match(/code|program|develop|код|програм|разработ/)) return '2-5 hours';
    if (t.match(/design|дизайн|макет/)) return '2-4 hours';
    if (task.priority === 'high') return '1-3 hours';
    if (task.priority === 'low') return '15-30 min';
    return '30-60 min';
  }

  getTip(task: Task): string {
    const t = (task.title + ' ' + (task.description || '')).toLowerCase();
    if (t.match(/clean|wash|mop|уборк|помы|постир/)) return 'Start with the hardest area first';
    if (t.match(/study|learn|read|homework|учи|читать|домашн/)) return 'Pomodoro: 25 min focus + 5 min break';
    if (t.match(/work|project|report|работ|проект|отчёт/)) return 'Break into subtasks, start with the main one';
    if (t.match(/exercise|gym|workout|тренир|спорт|зал/)) return 'Warm up 10 min, then main workout';
    if (t.match(/cook|dinner|lunch|готов|обед|ужин/)) return 'Prepare ingredients in advance';
    if (t.match(/shop|buy|grocery|магазин|купить/)) return 'Make a list, group by sections';
    if (t.match(/code|program|develop|код|програм/)) return 'Plan architecture first, then code';
    if (t.match(/play|game|игр|мафи/)) return 'Rest is important! But set a timer';
    if (task.priority === 'high') return 'Do this first thing in the morning';
    if (task.due_date) {
      const days = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
      if (days <= 0) return 'OVERDUE! Do it now';
      if (days <= 1) return 'Urgent! Less than a day left';
      if (days <= 3) return 'Deadline soon — plan ahead';
    }
    return 'Break into steps and start with the first one';
  }

  getNeeds(task: Task): string {
    const t = (task.title + ' ' + (task.description || '')).toLowerCase();
    if (t.match(/clean|wash|mop|уборк|помы/)) return 'Rags, cleaner, vacuum';
    if (t.match(/study|learn|homework|учи|домашн/)) return 'Notebook, textbook, quiet place';
    if (t.match(/cook|dinner|готов|обед|ужин/)) return 'Ingredients, kitchen tools';
    if (t.match(/exercise|gym|тренир|зал/)) return 'Sportswear, water bottle';
    if (t.match(/shop|buy|магазин|купить/)) return 'Shopping list, payment card';
    if (t.match(/code|program|код|програм/)) return 'Computer, IDE, documentation';
    if (t.match(/play|game|игр|мафи/)) return 'Friends, good mood';
    return 'Calm environment, action plan';
  }

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'User';
    this.avatarUrl = localStorage.getItem('avatarUrl') || null;
    const h = new Date().getHours();
    this.greeting = h < 6 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.ngZone.run(() => { this.tasks = tasks; this.isLoading = false; this.cdr.detectChanges(); });
      },
      error: () => {
        this.ngZone.run(() => { this.isLoading = false; this.cdr.detectChanges(); });
      }
    });
  }

  searchGoogle() {
    if (!this.searchQuery.trim()) return;
    this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
  }

  goToTasks() { this.router.navigate(['/tasks']); }
  goToAddTask() { this.router.navigate(['/tasks/new']); }
  goToProfile() { this.router.navigate(['/profile']); }
  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}
