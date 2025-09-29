import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent) },
  { path: 'daily-dare', loadComponent: () => import('./daily-dare/daily-dare.component').then(m => m.DailyDareComponent) },
  { path: 'activities', loadComponent: () => import('./activities/activities.component').then(m => m.ActivitiesComponent) },
  { path: 'groups', loadComponent: () => import('./groups/groups.component').then(m => m.GroupsComponent) },
  { path: 'notifications', loadComponent: () => import('./notifications/notifications.component').then(m => m.NotificationsComponent) },
  { path: 'tutorial', loadComponent: () => import('./tutorial/tutorial.component').then(m => m.TutorialComponent) },
  { path: 'profile/:user_id', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'profile/:user_id/history', loadComponent: () => import('./profile/profile-history.component').then(m => m.ProfileHistoryComponent) },
];





