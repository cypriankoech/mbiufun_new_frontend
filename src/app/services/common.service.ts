import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  // Show success message
  showSuccess(message: string, duration: number = 3000): void {
    console.log('SUCCESS:', message);
    // For now, just log - we can add proper notifications later
  }

  // Show error message
  showError(message: string, duration: number = 5000): void {
    console.error('ERROR:', message);
    // For now, just log - we can add proper notifications later
  }

  // Show warning message
  showWarning(message: string, duration: number = 4000): void {
    console.warn('WARNING:', message);
    // For now, just log - we can add proper notifications later
  }

  // Show info message
  showInfo(message: string, duration: number = 3000): void {
    console.info('INFO:', message);
    // For now, just log - we can add proper notifications later
  }

  // Format date to readable string
  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Format date with time
  formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calculate time ago
  timeAgo(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];

    for (const interval of intervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }

    return 'Just now';
  }

  // Generate random ID
  generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Copy text to clipboard
  copyToClipboard(text: string): Promise<void> {
    return navigator.clipboard.writeText(text);
  }

  // Check if device is mobile
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  // Scroll to top
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Get file extension
  getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  // Check if file is image
  isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const ext = this.getFileExtension(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }
}
