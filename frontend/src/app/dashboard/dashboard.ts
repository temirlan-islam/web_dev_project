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
    if (t.match(/clean|wash|laundry|dishes|mop|sweep|vacuum|уборк|помы|постир|пылесос/)) return '30-60 мин';
    if (t.match(/cook|dinner|lunch|breakfast|meal|готов|обед|ужин|завтрак/)) return '45-90 мин';
    if (t.match(/study|learn|read|homework|essay|exam|учи|читать|домашн|экзамен|подготов/)) return '1-3 часа';
    if (t.match(/work|project|report|presentation|работ|проект|отчёт|презентац/)) return '2-4 часа';
    if (t.match(/exercise|gym|run|workout|sport|тренир|спорт|бег|зал/)) return '30-60 мин';
    if (t.match(/shop|buy|store|grocery|market|магазин|купить|покупк/)) return '30-60 мин';
    if (t.match(/call|email|message|write|send|звон|письм|написа|отправ/)) return '10-20 мин';
    if (t.match(/fix|repair|install|setup|почин|ремонт|установ|настро/)) return '1-2 часа';
    if (t.match(/meet|meeting|appointment|встреч|собран/)) return '30-60 мин';
    if (t.match(/play|game|movie|watch|игр|кино|смотре|фильм/)) return '1-2 часа';
    if (t.match(/code|program|develop|код|програм|разработ/)) return '2-5 часов';
    if (t.match(/design|дизайн|макет/)) return '2-4 часа';
    if (task.priority === 'high') return '1-3 часа';
    if (task.priority === 'low') return '15-30 мин';
    return '30-60 мин';
  }

  getTip(task: Task): string {
    const t = (task.title + ' ' + (task.description || '')).toLowerCase();
    if (t.match(/clean|wash|mop|уборк|помы|постир/)) return 'Начни с самого сложного участка';
    if (t.match(/study|learn|read|homework|учи|читать|домашн/)) return 'Помодоро: 25 мин фокус + 5 мин отдых';
    if (t.match(/work|project|report|работ|проект|отчёт/)) return 'Раздели на подзадачи, начни с главной';
    if (t.match(/exercise|gym|workout|тренир|спорт|зал/)) return 'Разминка 10 мин, потом основная часть';
    if (t.match(/cook|dinner|lunch|готов|обед|ужин/)) return 'Подготовь ингредиенты заранее';
    if (t.match(/shop|buy|grocery|магазин|купить/)) return 'Составь список, группируй по отделам';
    if (t.match(/code|program|develop|код|програм/)) return 'Продумай архитектуру, потом код';
    if (t.match(/play|game|игр|мафи/)) return 'Отдых важен! Но поставь таймер';
    if (task.priority === 'high') return 'Сделай первым делом утром';
    if (task.due_date) {
      const days = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000);
      if (days <= 0) return 'ПРОСРОЧЕНО! Сделай сейчас';
      if (days <= 1) return 'Срочно! Осталось меньше суток';
      if (days <= 3) return 'Дедлайн скоро — запланируй';
    }
    return 'Раздели на шаги и начни с первого';
  }

  getNeeds(task: Task): string {
    const t = (task.title + ' ' + (task.description || '')).toLowerCase();
    if (t.match(/clean|wash|mop|уборк|помы/)) return 'Тряпки, моющее, пылесос';
    if (t.match(/study|learn|homework|учи|домашн/)) return 'Тетрадь, учебник, тихое место';
    if (t.match(/cook|dinner|готов|обед|ужин/)) return 'Продукты, кухонная утварь';
    if (t.match(/exercise|gym|тренир|зал/)) return 'Спортивная одежда, вода';
    if (t.match(/shop|buy|магазин|купить/)) return 'Список покупок, карта';
    if (t.match(/code|program|код|програм/)) return 'Компьютер, IDE, документация';
    if (t.match(/play|game|игр|мафи/)) return 'Друзья, хорошее настроение';
    return 'Спокойная обстановка, план действий';
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
