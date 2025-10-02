import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface GroupParticipant {
  participantType: number;
  id: number;
  username: string;
  avatar: string;
  status: number;
}

export interface GroupData {
  participant: {
    participantType: number;
    id: string;
    displayName: string;
    avatar: string;
    status: number;
    chattingTo: GroupParticipant[];
  };
  metadata: {
    totalUnreadMessages: number;
  };
}

export interface GroupMember {
  id: number;
  name: string;
  initials: string;
  avatar?: string;
}

export interface GroupMessage {
  sender: string;
  senderInitials: string;
  text: string;
  time: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unreadCount: number;
  hasActivity: boolean;
  activityType?: string;
  lastMessage?: GroupMessage;
  recentMembers: GroupMember[];
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl.replace(/\/$/, '')}/api/v1/chat`;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('mbiu-token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });
  }

  getUserGroups(): Observable<Group[]> {
    const headers = this.getHeaders();
    return this.http.get<GroupData[]>(`${this.baseUrl}/groups`, { headers }).pipe(
      map(groups => this.transformGroups(groups)),
      catchError(error => {
        console.error('Failed to load groups:', error);
        return throwError(() => new Error('Failed to load groups'));
      })
    );
  }

  createGroup(groupData: {
    name: string;
    description: string;
    category: string;
    privacy: string;
    participants?: string[];
  }): Observable<any> {
    const headers = this.getHeaders();

    // Generate a unique group ID
    const groupId = `grp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payload = {
      id: groupId,
      displayName: groupData.name,
      description: groupData.description,
      category: groupData.category,
      is_private: groupData.privacy === 'private',
      chattingTo: (groupData.participants || []).map(username => ({ username })) // Format participants correctly
    };

    return this.http.post(`${this.baseUrl}/create_update_grp/`, payload, { headers }).pipe(
      catchError(error => {
        console.error('Failed to create group:', error);
        return throwError(() => error);
      })
    );
  }

  private transformGroups(apiGroups: GroupData[]): Group[] {
    return apiGroups.map(apiGroup => {
      const participant = apiGroup.participant;
      const chattingTo = participant.chattingTo || [];

      // Create recent members from chattingTo
      const recentMembers: GroupMember[] = chattingTo.slice(0, 4).map(p => ({
        id: p.id,
        name: p.username || `User ${p.id}`,
        initials: this.getInitials(p.username || `User ${p.id}`),
        avatar: p.avatar
      }));

      // Generate mock last message (in a real app, this would come from the API)
      const lastMessage = this.generateMockLastMessage(recentMembers);

      // Generate mock activity data
      const activities = ['Planning', 'Challenge', 'Studying', 'Creating'];
      const activityType = activities[Math.floor(Math.random() * activities.length)];

      return {
        id: participant.id,
        name: participant.displayName,
        description: this.generateMockDescription(participant.displayName),
        memberCount: chattingTo.length + 1, // Include current user
        unreadCount: apiGroup.metadata.totalUnreadMessages || Math.floor(Math.random() * 8),
        hasActivity: Math.random() > 0.5,
        activityType,
        lastMessage,
        recentMembers
      };
    });
  }

  private generateMockLastMessage(members: GroupMember[]): GroupMessage | undefined {
    if (members.length === 0) return undefined;

    const messages = [
      'Hey everyone! How\'s the weekend going?',
      'Just finished an amazing workout! 💪',
      'Anyone up for a study session?',
      'Check out this cool article I found!',
      'Let\'s plan our next adventure! 🏔️',
      'Working on some creative projects 🎨',
      'Thanks for the help with that problem!',
      'Who wants to grab coffee tomorrow?'
    ];

    const randomMember = members[Math.floor(Math.random() * members.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      sender: randomMember.name,
      senderInitials: randomMember.initials,
      text: randomMessage,
      time: this.getRandomTimeAgo()
    };
  }

  private generateMockDescription(name: string): string {
    const descriptions = [
      'Planning epic weekend adventures, hikes, and outdoor activities. Let\'s make memories!',
      'Collaborative learning, exam prep, and academic support. Knowledge is power!',
      'Daily workouts, healthy recipes, and motivation. Stronger together! 💪',
      'Artists, writers, and creators sharing work, feedback, and inspiration. 🎨✍️',
      'Weekend warriors conquering challenges and building habits together!',
      'Tech enthusiasts sharing knowledge, projects, and innovation. 🚀',
      'Book lovers discussing stories, authors, and literary adventures. 📚',
      'Music makers sharing beats, lyrics, and creative vibes. 🎵'
    ];

    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private getRandomTimeAgo(): string {
    const times = ['2h ago', '1d ago', '30m ago', '5h ago', '3d ago', '15m ago'];
    return times[Math.floor(Math.random() * times.length)];
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }
}

