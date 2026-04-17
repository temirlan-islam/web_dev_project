import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: boolean;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string | null;
  created_at?: string;
  category?: number | null;
  category_name?: string;
}

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://127.0.0.1:8000/api/tasks/';
  private catUrl = 'http://127.0.0.1:8000/api/categories/';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http
      .get<Task[] | { results: Task[] }>(this.apiUrl, {
        params: { _ts: Date.now().toString() }
      })
      .pipe(
        map((response) => Array.isArray(response) ? response : (response.results ?? []))
      );
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}${id}/`);
  }

  createTask(task: Task): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}${id}/`, task);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.catUrl);
  }
}