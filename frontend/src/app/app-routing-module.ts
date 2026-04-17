import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { TaskList } from './task-list/task-list';
import { TaskForm } from './task-form/task-form';
import { Profile } from './profile/profile';
import { SearchPage } from './search/search';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'tasks', component: TaskList, canActivate: [AuthGuard] },
  { path: 'tasks/new', component: TaskForm, canActivate: [AuthGuard] },
  { path: 'tasks/:id', component: TaskForm, canActivate: [AuthGuard] },
  { path: 'profile', component: Profile, canActivate: [AuthGuard] },
  { path: 'search', component: SearchPage, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
