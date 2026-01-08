import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface GroupParticipant {
  participant?: {
    participantType: number;
    id: number;
    username: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatar: string;
    status: number;
  };
  // Support both nested and flat formats
  participantType?: number;
  id?: number;
  username?: string;
  displayName?: string;
  avatar?: string;
  status?: number;
}

export interface GroupData {
  participant: {
    participantType: number;
    id: string;
    displayName: string;
    description?: string; // Will be available after backend migration
    avatar: string;
    status: number;
    chattingTo: GroupParticipant[];
    participantCount?: number;
  };
  metadata: {
    totalUnreadMessages: number;
    lastMessage?: {
      text: string;
      sender: string;
      time: string;
    };
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
  description?: string;
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
    description?: string;
    category: string;
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
      chattingTo: (groupData.participants || []).map(username => ({ username })) // Format participants correctly
    };

    return this.http.post(`${this.baseUrl}/create_update_grp/`, payload, { headers }).pipe(
      catchError(error => {
        console.error('Failed to create group:', error);
        return throwError(() => error);
      })
    );
  }

  updateGroup(groupId: string, groupData: {
    name: string;
    description: string;
  }): Observable<any> {
    const headers = this.getHeaders();

    const payload = {
      id: groupId,
      displayName: groupData.name,
      description: groupData.description,
      category: 'other', // Default category for updates
      is_private: false, // Default privacy for updates
      chattingTo: [] // No participant changes during basic info update
    };

    return this.http.post(`${this.baseUrl}/create_update_grp/`, payload, { headers }).pipe(
      catchError(error => {
        console.error('Failed to update group:', error);
        return throwError(() => error);
      })
    );
  }

  addParticipant(groupId: string, identifier: string): Observable<any> {
    const headers = this.getHeaders();

    const payload = {
      group_id: groupId,
      identifier: identifier // username or email
    };

    return this.http.post(`${this.baseUrl}/add_participant/`, payload, { headers }).pipe(
      catchError(error => {
        console.error('Failed to add participant:', error);
        return throwError(() => error);
      })
    );
  }

  private transformGroups(apiGroups: GroupData[]): Group[] {
    return apiGroups.map(apiGroup => {
      const participant = apiGroup.participant;
      const chattingTo = participant.chattingTo || [];

      // Create recent members from chattingTo (handle nested participant structure)
      const recentMembers: GroupMember[] = chattingTo.slice(0, 4).map(item => {
        const p = item.participant || item; // Handle both nested and direct formats
        const participantId = p.id || (item as any).id || 0;
        const displayName = p.displayName || p.username || `User ${participantId}`;
        const avatarUrl = p.avatar || (item as any).avatar || '';
        
        return {
          id: participantId,
          name: displayName,
          initials: this.getInitials(displayName),
          avatar: avatarUrl
        };
      });

      // Use real last message if available, otherwise no message
      let lastMessage: GroupMessage | undefined;
      if (apiGroup.metadata.lastMessage) {
        lastMessage = {
          sender: apiGroup.metadata.lastMessage.sender,
          senderInitials: this.getInitials(apiGroup.metadata.lastMessage.sender),
          text: apiGroup.metadata.lastMessage.text,
          time: apiGroup.metadata.lastMessage.time
        };
      }

      return {
        id: participant.id,
        name: participant.displayName,
        description: participant.description || '',
        memberCount: participant.participantCount || chattingTo.length, // Use API participantCount if available, otherwise calculate from chattingTo
        unreadCount: apiGroup.metadata.totalUnreadMessages || Math.floor(Math.random() * 8),
        hasActivity: Math.random() > 0.5,
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

