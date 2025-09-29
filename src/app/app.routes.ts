import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { TemplateComponent } from './templates/main/template.component';
import { LandingComponent } from './pages/landing/landing.component';
import { AuthGuard } from './guards/auth.guard';
import { GroupsComponent } from './pages/groups/groups.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ProfileHistoryComponent } from './pages/profile/profile-history.component';
import { TutorialComponent } from './pages/tutorial/tutorial.component';
// Lazy load Daily Dare components via loadComponent
import { ActivitiesComponent } from './pages/activities/activities.component';

export const routes: Routes = [
  // Root route - redirect to app (will trigger AuthGuard)
  {
    path: '',
    redirectTo: '/app',
    pathMatch: 'full'
  },

  // Authentication routes (public)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Main application routes (protected)
  {
    path: 'app',
    component: TemplateComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: ActivitiesComponent }, // Activities/Feed is now the home tab
      { path: 'landing', component: LandingComponent }, // Keep old landing accessible
      { path: 'daily-dare', loadComponent: () => import('./pages/daily-dare/daily-dare.component').then(m => m.DailyDareComponent) },
      { path: 'daily-dare/:id', loadComponent: () => import('./pages/daily-dare/daily-dare-detail.component').then(m => m.DailyDareDetailComponent) },
      { path: 'groups', component: GroupsComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'tutorial', component: TutorialComponent },
      { path: 'profile/:user_id', component: ProfileComponent },
      { path: 'profile/:user_id/history', component: ProfileHistoryComponent },
      // Add more protected routes as needed
    ]
  },

  // Fallback route
  { path: '**', component: LandingComponent }
];
