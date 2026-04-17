import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthGuard } from './guards/auth.guard';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { TaskList } from './task-list/task-list';
import { TaskForm } from './task-form/task-form';
import { Profile } from './profile/profile';
import { SearchPage } from './search/search';
import { AuthInterceptor } from './interceptors/auth-interceptor';

@NgModule({
  declarations: [
    App,
    Login,
    Dashboard,
    TaskList,
    TaskForm,
    Profile,
    SearchPage
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [App]
})
export class AppModule { }
