export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  action?: string;
  action_url?: string;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
  completed: boolean;
  current_step?: number;
}


