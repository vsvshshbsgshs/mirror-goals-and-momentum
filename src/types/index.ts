export type GoalStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalCategory = 
  | 'health' 
  | 'learning' 
  | 'career' 
  | 'finance' 
  | 'organization' 
  | 'personal_dev' 
  | 'other';

export type MissionStatus = 'pending' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
export type MissionPriority = 'low' | 'medium' | 'high';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  timezone: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  preferred_days: string[]; // ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
  daily_available_minutes: number; // e.g. 45
  preferred_time: 'morning' | 'afternoon' | 'evening' | 'flexible';
  notification_preferences: {
    missions_reminders: boolean;
    weekly_digest: boolean;
    achievement_alerts: boolean;
    daily_start_reminder: boolean;
  };
  assistant_response_style: 'direct' | 'detailed' | 'progressive';
  updated_at: string;
}

export interface GoalDiagnostic {
  id: string;
  goal_id: string;
  user_id: string;
  current_situation: string;
  obstacles: string[];
  available_resources: string[];
  constraints: string;
  answers?: Record<string, any>;
  created_at: string;
}

export interface GoalStep {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  description: string;
  position: number;
  success_criteria: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Mission {
  id: string;
  goal_id: string;
  goal_step_id?: string;
  user_id: string;
  title: string;
  instructions: string;
  estimated_minutes: number;
  scheduled_date?: string; // YYYY-MM-DD
  scheduled_time?: string; // HH:MM
  priority: MissionPriority;
  status: MissionStatus;
  position: number;
  completed_at?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: GoalCategory;
  desired_outcome: string;
  current_state: string;
  target_date?: string;
  priority: GoalPriority;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // Populated relations
  diagnostic?: GoalDiagnostic;
  steps?: GoalStep[];
  missions?: Mission[];
}

export interface ActivityEvent {
  id: string;
  user_id: string;
  goal_id?: string;
  mission_id?: string;
  event_type: 
    | 'mission_completed' 
    | 'mission_started' 
    | 'mission_postponed' 
    | 'goal_created' 
    | 'goal_completed' 
    | 'goal_paused' 
    | 'step_completed' 
    | 'plan_adapted'
    | 'diagnostic_completed';
  metadata: Record<string, any>;
  created_at: string;
}

export interface AssistantMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface AssistantConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: AssistantMessage[];
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'reminder' | 'milestone' | 'routine' | 'system';
  title: string;
  body: string;
  read_at?: string;
  created_at: string;
}

export type SubscriptionStatus = 'none' | 'active' | 'trial' | 'past_due' | 'canceled' | 'expired';

export interface Subscription {
  id: string;
  user_id: string;
  provider: 'delux_billing';
  provider_customer_id?: string;
  provider_subscription_id?: string;
  status: SubscriptionStatus;
  price_amount: number; // 29.90
  currency: 'BRL';
  current_period_end?: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}
