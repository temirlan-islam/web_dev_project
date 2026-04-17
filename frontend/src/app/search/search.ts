import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-search',
  standalone: false,
  templateUrl: './search.html',
  styleUrls: ['./search.css']
})
export class SearchPage implements OnInit {
  query = '';
  searchUrl: SafeResourceUrl | null = null;
  username = '';
  avatarUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || 'User';
    this.avatarUrl = localStorage.getItem('avatarUrl') || null;
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.query = params['q'];
        this.doSearch();
      }
    });
  }

  doSearch() {
    if (!this.query.trim()) return;
    const url = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(this.query);
    this.searchUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onSearch() {
    if (!this.query.trim()) return;
    this.router.navigate(['/search'], { queryParams: { q: this.query } });
  }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}
