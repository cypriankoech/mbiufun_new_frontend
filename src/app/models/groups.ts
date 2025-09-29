export interface Participant {
  username?: string;
  id?: string;
  displayName?: string;
}

export interface Group {
  id: string;
  displayName: string;
  chattingTo: Participant[];
  isCompetitive?: boolean;
}

export interface GroupResponse {
  participant: GroupDetailResponse;
  metadata: {
    totalUnreadMessages: number;
  };
}

export interface GroupDetailResponse {
  avatar: string;
  chattingTo: { participant: Participant }[];
  id: string;
  participantType: number;
  status: number;
  displayName: string;
}





