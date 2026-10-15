import { supabase } from "@/integrations/supabase/client";
import * as fns from "@/lib/delux.functions";
import {
  UserProfile,
  UserPreferences,
  Goal,
  GoalStep,
  Mission,
  ActivityEvent,
  AssistantConversation,
  AssistantMessage,
  AppNotification,
  Subscription,
} from "../types";

export const api = {
  getToken(): string | null {
    return null;
  },

  setToken(_token: string) {
    // Session managed by Lovable Cloud auth.
  },

  clearToken() {
    // Session managed by Lovable Cloud auth.
  },

  // Auth
  async getMe(): Promise<{ user: UserProfile }> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Não autenticado.");
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    if (!data) throw new Error("Não autenticado.");
    return { user: data as UserProfile };
  },

  async completeOnboarding(data: {
    preferences: any;
    firstGoal?: any;
    full_name?: string;
    name?: string;
  }): Promise<{ success: boolean; user: UserProfile }> {
    return fns.completeOnboarding({ data });
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<{ user: UserProfile }> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Não autenticado.");
    const update: Record<string, any> = { updated_at: new Date().toISOString() } as any;
    if (profileData.full_name !== undefined) update.full_name = profileData.full_name;
    if (profileData.timezone !== undefined) update.timezone = profileData.timezone;
    if (profileData.avatar_url !== undefined) update.avatar_url = profileData.avatar_url;
    const { data } = await supabase
      .from("profiles")
      .update(update as any)
      .eq("id", session.user.id)
      .select()
      .single();
    return { user: data as UserProfile };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    return {
      success: true,
      message:
        "Se o e-mail estiver cadastrado, enviamos um link seguro para redefinir sua senha.",
    };
  },

  // Preferences
  async getPreferences(): Promise<{ preferences: UserPreferences }> {
    return fns.getPreferences({ data: undefined as any });
  },

  async updatePreferences(pref: Partial<UserPreferences>): Promise<{ preferences: UserPreferences }> {
    return fns.updatePreferences({ data: pref });
  },

  // Goals
  async getGoals(): Promise<{ goals: Goal[] }> {
    return fns.getGoals({ data: undefined as any });
  },

  async getGoal(id: string): Promise<{ goal: Goal }> {
    return fns.getGoal({ data: { id } });
  },

  async createGoal(
    payload: Omit<Partial<Goal>, "diagnostic" | "steps" | "missions"> & {
      diagnostic?: any;
      steps?: any[];
      missions?: any[];
    }
  ): Promise<{ goal: Goal }> {
    return fns.createGoal({ data: payload });
  },

  async updateGoal(id: string, payload: Partial<Goal>): Promise<{ goal: Goal }> {
    return fns.updateGoal({ data: { id, ...payload } });
  },

  async deleteGoal(id: string): Promise<{ success: boolean; message: string }> {
    return fns.deleteGoal({ data: { id } });
  },

  async createGoalStep(
    goalId: string,
    payload: { title: string; description?: string; success_criteria?: string }
  ): Promise<{ step: GoalStep }> {
    return fns.createGoalStep({ data: { goalId, ...payload } });
  },

  async updateGoalStep(stepId: string, payload: Partial<GoalStep>): Promise<{ step: GoalStep }> {
    return fns.updateGoalStep({ data: { id: stepId, ...payload } });
  },

  // Missions
  async getMissions(params?: {
    date?: string;
    status?: string;
    goal_id?: string;
  }): Promise<{ missions: Mission[] }> {
    return fns.getMissions({ data: params ?? {} });
  },

  async createMission(payload: Partial<Mission>): Promise<{ mission: Mission }> {
    return fns.createMission({ data: payload });
  },

  async updateMission(id: string, payload: Partial<Mission>): Promise<{ mission: Mission }> {
    return fns.updateMission({ data: { id, ...payload } });
  },

  async toggleMission(id: string): Promise<{ mission: Mission }> {
    return fns.toggleMission({ data: { id } });
  },

  async deleteMission(id: string): Promise<{ success: boolean }> {
    return fns.deleteMission({ data: { id } });
  },

  // Planner
  async getPlanner(): Promise<{ days: any[]; goals: Goal[]; preferences: UserPreferences }> {
    return fns.getPlanner({ data: undefined as any });
  },

  async rebalancePlanner(): Promise<{ success: boolean; rescheduledCount: number; message: string }> {
    return fns.rebalancePlanner({ data: undefined as any });
  },

  // Activity & Metrics
  async getActivity(): Promise<{ events: ActivityEvent[]; metrics: any }> {
    return fns.getActivity({ data: undefined as any });
  },

  // Notifications
  async getNotifications(): Promise<{ notifications: AppNotification[] }> {
    return fns.getNotifications({ data: undefined as any });
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return fns.markNotificationRead({ data: { id } });
  },

  // Subscription
  async getSubscription(): Promise<{ subscription: Subscription }> {
    return fns.getSubscription({ data: undefined as any });
  },

  async toggleSubscription(): Promise<{ subscription: Subscription }> {
    return fns.toggleSubscription({ data: undefined as any });
  },

  // Assistant
  async getConversations(): Promise<{ conversations: AssistantConversation[] }> {
    return fns.getConversations({ data: undefined as any });
  },

  async getMessages(
    conversationId: string
  ): Promise<{ conversation: AssistantConversation; messages: AssistantMessage[] }> {
    return fns.getMessages({ data: { conversationId } });
  },

  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    return fns.deleteConversation({ data: { conversationId } });
  },

  async sendChatMessage(
    message: string,
    conversation_id?: string
  ): Promise<{
    conversation: AssistantConversation;
    userMessage: AssistantMessage;
    assistantMessage: AssistantMessage;
  }> {
    return fns.sendChatMessage({ data: { message, conversation_id } });
  },

  async generatePlan(payload: {
    title: string;
    current_state?: string;
    desired_outcome?: string;
    available_minutes?: number;
  }): Promise<{ steps: any[]; missions: any[] }> {
    return fns.generatePlan({ data: payload });
  },
};
