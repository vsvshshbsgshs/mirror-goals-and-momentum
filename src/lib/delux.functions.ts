import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

const now = () => new Date().toISOString();
const todayStr = () => new Date().toISOString().split("T")[0];

async function logEvent(
  supabase: any,
  userId: string,
  eventType: string,
  metadata: Record<string, any>,
  goalId?: string | null,
  missionId?: string | null
) {
  await supabase.from("activity_events").insert({
    user_id: userId,
    goal_id: goalId ?? null,
    mission_id: missionId ?? null,
    event_type: eventType,
    metadata,
  });
}

async function hydrateGoal(supabase: any, goal: any) {
  const [{ data: diag }, { data: steps }, { data: missions }] = await Promise.all([
    supabase.from("diagnostics").select("*").eq("goal_id", goal.id).maybeSingle(),
    supabase.from("steps").select("*").eq("goal_id", goal.id).order("position"),
    supabase.from("missions").select("*").eq("goal_id", goal.id),
  ]);
  return { ...goal, diagnostic: diag ?? undefined, steps: steps ?? [], missions: missions ?? [] };
}

async function getOrCreatePreferences(supabase: any, userId: string) {
  const { data } = await supabase.from("preferences").select("*").eq("user_id", userId).maybeSingle();
  if (data) return data;
  const { data: created } = await supabase
    .from("preferences")
    .insert({ user_id: userId })
    .select()
    .single();
  return created;
}

// ---------- AI (Lovable AI Gateway, Gemini) ----------

async function callGemini(prompt: string, json = false): Promise<string | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return null;
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "user", content: prompt }],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text());
      return null;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error("AI gateway call failed", e);
    return null;
  }
}

function deterministicAssistantResponse(
  query: string,
  name: string,
  goals: any[],
  missions: any[]
): string {
  const q = query.toLowerCase();

  if (q.includes("priorizar") || q.includes("hoje") || q.includes("começar")) {
    if (missions.length > 0) {
      const first = missions[0];
      return `Olá ${name}. Para hoje, a sua prioridade mais estratégica é:

**1. ${first.title}**
- Duração estimada: ${first.estimated_minutes} min.
- Recomendação: Reserve um bloco sem distrações no seu horário habitual. Complete essa etapa antes de abrir novas frentes.

Deseja que eu divida essa atividade em subtarefas de 10 minutos?`;
    }
    return `Olá ${name}. Atualmente você não possui missões agendadas para hoje. Recomendo escolher seu objetivo ativo mais importante e definir uma ação de até 25 minutos. Deseja criar uma nova missão agora?`;
  }

  if (q.includes("consistência") || q.includes("disciplina") || q.includes("dificuldade")) {
    return `Manter consistência é uma questão de atrito e dimensão de esforço, não apenas força de vontade.

Aqui estão 3 princípios Delux recomendados para você:
1. **Reduza a barreira de entrada**: Se a missão pede 40 minutos e você está exausto, cumpra apenas os primeiros 10 minutos. O compromisso é não quebrar o hábito.
2. **Âncora temporal fixa**: Execute sempre no mesmo horário pré-estabelecido.
3. **Sem compensações acumuladas**: Se perder um dia, não tente fazer o dobro no dia seguinte. Apenas retome o ritmo habitual.

Qual o maior obstáculo que tem dificultado sua rotina esta semana?`;
  }

  if (q.includes("organizar") || q.includes("plano") || q.includes("meta") || q.includes("objetivo")) {
    if (goals.length > 0) {
      const g = goals[0];
      return `Analisando seu objetivo principal **"${g.title}"**:

- **Foco atual**: Concentrar-se no próximo marco concreto.
- **Resultado esperado**: ${g.desired_outcome || "Evolução mensurável com prática guiada"}.

Para acelerar sua clareza, sugiro revisar as etapas dentro da aba de Objetivos ou me dizer qual barreira técnica está encontrando.`;
    }
    return `Para construirmos um plano sólido, comece definindo:
1. Qual resultado tangível você quer ver em 30 a 90 dias?
2. Quantos minutos diários você consegue garantir com tranquilidade?

Me conte um objetivo que você quer transformar em plano agora!`;
  }

  return `Entendido, ${name}. Como assistente executivo do Delux, posso ajudar você a:
- Ajustar e redistribuir seu planejamento da semana
- Quebrar metas complexas em missões de 15 a 45 minutos
- Diagnosticar onde estão os gargalos de consistência

Como prefere avançar hoje?`;
}

// ========================
// ONBOARDING & PROFILE
// ========================

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    const { preferences, firstGoal, name, full_name } = data ?? {};

    const profileUpdate: Record<string, any> = {
      onboarding_completed: true,
      updated_at: now(),
    };
    const displayName = (name || full_name || "").trim();
    if (displayName) profileUpdate.full_name = displayName;

    const { data: user } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId)
      .select()
      .single();

    if (preferences) {
      await supabase.from("preferences").upsert({
        user_id: userId,
        ...preferences,
        updated_at: now(),
      });
    }

    if (firstGoal?.title) {
      const target =
        firstGoal.target_date ||
        new Date(Date.now() + 60 * 86400000).toISOString().split("T")[0];
      const { data: goal } = await supabase
        .from("goals")
        .insert({
          user_id: userId,
          title: firstGoal.title,
          description: firstGoal.description || "",
          category: firstGoal.category || "personal_dev",
          desired_outcome: firstGoal.desired_outcome || firstGoal.title,
          current_state: firstGoal.current_state || "",
          priority: firstGoal.priority || "high",
          status: "active",
          target_date: target,
        })
        .select()
        .single();

      await supabase.from("diagnostics").insert({
        goal_id: goal.id,
        user_id: userId,
        current_situation: firstGoal.current_state || "Iniciando trajetória",
        obstacles: firstGoal.obstacles || ["Constância na rotina"],
        available_resources: [`${preferences?.daily_available_minutes || 30} minutos/dia`],
        constraints: firstGoal.constraints || "Horário de estudos/prática",
        answers: firstGoal.answers ?? null,
      });

      const { data: step1 } = await supabase
        .from("steps")
        .insert({
          goal_id: goal.id,
          user_id: userId,
          title: "Etapa 1: Diagnóstico e Fundação",
          description: "Estabelecer os primeiros hábitos essenciais e fundamentos da prática.",
          position: 1,
          success_criteria: "Completar os primeiros 7 dias de execução consistente.",
          status: "in_progress",
        })
        .select()
        .single();

      await supabase.from("steps").insert({
        goal_id: goal.id,
        user_id: userId,
        title: "Etapa 2: Aprofundamento Prático",
        description: "Elevar a complexidade das tarefas e validar evolução.",
        position: 2,
        success_criteria: "Superar os principais obstáculos identificados no diagnóstico.",
        status: "pending",
      });

      await supabase.from("missions").insert({
        goal_id: goal.id,
        goal_step_id: step1.id,
        user_id: userId,
        title: `Iniciar primeiro bloco prático: ${firstGoal.title}`,
        instructions:
          "Dedique o tempo estipulado sem distrações. Anote as sensações e os pontos de melhora.",
        estimated_minutes: preferences?.daily_available_minutes || 30,
        scheduled_date: todayStr(),
        scheduled_time: "09:00",
        priority: "high",
        status: "pending",
        position: 1,
      });

      await logEvent(supabase, userId, "goal_created", { title: goal.title }, goal.id);
    }

    return { success: true, user };
  });

// ========================
// PREFERENCES
// ========================

export const getPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const preferences = await getOrCreatePreferences(context.supabase, context.userId);
    return { preferences };
  });

export const updatePreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    const { data: preferences } = await supabase
      .from("preferences")
      .upsert({ user_id: userId, ...data, updated_at: now() })
      .select()
      .single();
    return { preferences };
  });

// ========================
// GOALS
// ========================

export const getGoals = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const { data: goals } = await context.supabase
      .from("goals")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    const populated = await Promise.all((goals ?? []).map((g: any) => hydrateGoal(context.supabase, g)));
    return { goals: populated };
  });

export const getGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }: { data: { id: string }; context: Ctx }) => {
    const { data: goal } = await context.supabase
      .from("goals")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!goal) throw new Error("Objetivo não encontrado.");
    return { goal: await hydrateGoal(context.supabase, goal) };
  });

export const createGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    if (!data?.title) throw new Error("O título do objetivo é obrigatório.");

    const { data: goal, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: data.title.trim(),
        description: (data.description || "").trim(),
        category: data.category || "personal_dev",
        desired_outcome: (data.desired_outcome || data.title).trim(),
        current_state: (data.current_state || "").trim(),
        target_date: data.target_date || null,
        priority: data.priority || "medium",
        status: "active",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (data.diagnostic) {
      await supabase.from("diagnostics").insert({
        goal_id: goal.id,
        user_id: userId,
        current_situation: data.diagnostic.current_situation || data.current_state || "",
        obstacles: data.diagnostic.obstacles || [],
        available_resources: data.diagnostic.available_resources || [],
        constraints: data.diagnostic.constraints || "",
        answers: data.diagnostic.answers ?? null,
      });
    }

    if (Array.isArray(data.steps) && data.steps.length > 0) {
      await supabase.from("steps").insert(
        data.steps.map((st: any, idx: number) => ({
          goal_id: goal.id,
          user_id: userId,
          title: st.title,
          description: st.description || "",
          position: idx + 1,
          success_criteria: st.success_criteria || "",
          status: idx === 0 ? "in_progress" : "pending",
        }))
      );
    }

    if (Array.isArray(data.missions) && data.missions.length > 0) {
      await supabase.from("missions").insert(
        data.missions.map((m: any, idx: number) => ({
          goal_id: goal.id,
          goal_step_id: m.goal_step_id || null,
          user_id: userId,
          title: m.title,
          instructions: m.instructions || "",
          estimated_minutes: m.estimated_minutes || 30,
          scheduled_date: m.scheduled_date || todayStr(),
          scheduled_time: m.scheduled_time || "09:00",
          priority: m.priority || "medium",
          status: "pending",
          position: idx + 1,
        }))
      );
    }

    await logEvent(supabase, userId, "goal_created", { title: goal.title }, goal.id);
    return { goal: await hydrateGoal(supabase, goal) };
  });

export const updateGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    const { id, ...payload } = data;
    const update: Record<string, any> = { updated_at: now() };
    for (const key of ["title", "description", "category", "desired_outcome", "current_state", "target_date", "priority"]) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }
    if (payload.status) {
      update.status = payload.status;
      if (payload.status === "completed") update.completed_at = now();
    }
    const { data: goal } = await supabase
      .from("goals")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (!goal) throw new Error("Objetivo não encontrado.");
    if (payload.status === "completed") {
      await logEvent(supabase, userId, "goal_completed", { title: goal.title }, goal.id);
    }
    return { goal };
  });

export const deleteGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }: { data: { id: string }; context: Ctx }) => {
    await context.supabase.from("goals").delete().eq("id", data.id).eq("user_id", context.userId);
    return { success: true, message: "Objetivo excluído com sucesso." };
  });

export const createGoalStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    const { goalId, title, description, success_criteria } = data;
    if (!title) throw new Error("Título da etapa é obrigatório.");
    const { data: existing } = await supabase.from("steps").select("id").eq("goal_id", goalId);
    const { data: step } = await supabase
      .from("steps")
      .insert({
        goal_id: goalId,
        user_id: userId,
        title: title.trim(),
        description: description || "",
        position: (existing?.length ?? 0) + 1,
        success_criteria: success_criteria || "",
        status: (existing?.length ?? 0) === 0 ? "in_progress" : "pending",
      })
      .select()
      .single();
    return { step };
  });

export const updateGoalStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    const { id, ...payload } = data;
    const update: Record<string, any> = { updated_at: now() };
    for (const key of ["title", "description", "success_criteria", "position"]) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }
    if (payload.status) {
      update.status = payload.status;
      if (payload.status === "completed") update.completed_at = now();
    }
    const { data: step } = await supabase
      .from("steps")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (!step) throw new Error("Etapa não encontrada.");
    if (payload.status === "completed") {
      await logEvent(supabase, userId, "step_completed", { title: step.title }, step.goal_id);
    }
    return { step };
  });

// ========================
// MISSIONS
// ========================

export const getMissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data ?? {})
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    let query = context.supabase.from("missions").select("*").eq("user_id", context.userId);
    if (data?.date) query = query.eq("scheduled_date", data.date);
    if (data?.status) query = query.eq("status", data.status);
    if (data?.goal_id) query = query.eq("goal_id", data.goal_id);
    const { data: missions } = await query
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true })
      .order("position", { ascending: true });
    return { missions: missions ?? [] };
  });

export const createMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    if (!data?.title) throw new Error("Título da missão é obrigatório.");
    if (!data?.goal_id) throw new Error("Selecione o objetivo da missão.");
    const { data: mission } = await supabase
      .from("missions")
      .insert({
        user_id: userId,
        goal_id: data.goal_id,
        goal_step_id: data.goal_step_id || null,
        title: data.title.trim(),
        instructions: data.instructions || "",
        estimated_minutes: parseInt(data.estimated_minutes, 10) || 30,
        scheduled_date: data.scheduled_date || todayStr(),
        scheduled_time: data.scheduled_time || null,
        priority: data.priority || "medium",
        status: "pending",
        position: 1,
      })
      .select()
      .single();
    return { mission };
  });

export const updateMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data, context }: { data: any; context: Ctx }) => {
    const { supabase, userId } = context;
    const { id, ...payload } = data;
    const update: Record<string, any> = { updated_at: now() };
    for (const key of ["title", "instructions", "scheduled_date", "scheduled_time", "priority", "note"]) {
      if (payload[key] !== undefined) update[key] = payload[key];
    }
    if (payload.estimated_minutes !== undefined) {
      update.estimated_minutes = parseInt(payload.estimated_minutes, 10);
    }
    if (payload.status) {
      update.status = payload.status;
      if (payload.status === "completed") update.completed_at = now();
    }
    const { data: mission } = await supabase
      .from("missions")
      .update(update)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (!mission) throw new Error("Missão não encontrada.");
    if (payload.status === "completed") {
      await logEvent(supabase, userId, "mission_completed", { title: mission.title }, mission.goal_id, mission.id);
    } else if (payload.status === "postponed") {
      await logEvent(supabase, userId, "mission_postponed", { title: mission.title }, mission.goal_id, mission.id);
    }
    return { mission };
  });

export const deleteMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }: { data: { id: string }; context: Ctx }) => {
    await context.supabase.from("missions").delete().eq("id", data.id).eq("user_id", context.userId);
    return { success: true };
  });

export const toggleMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }: { data: { id: string }; context: Ctx }) => {
    const { supabase, userId } = context;
    const { data: mission } = await supabase
      .from("missions")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (!mission) throw new Error("Missão não encontrada.");

    const completing = mission.status !== "completed";
    const { data: updated } = await supabase
      .from("missions")
      .update({
        status: completing ? "completed" : "pending",
        completed_at: completing ? now() : null,
        updated_at: now(),
      })
      .eq("id", mission.id)
      .select()
      .single();
    if (completing) {
      await logEvent(supabase, userId, "mission_completed", { title: mission.title }, mission.goal_id, mission.id);
    }
    return { mission: updated };
  });

// ========================
// PLANNER
// ========================

export const getPlanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const { supabase, userId } = context;
    const preferences = await getOrCreatePreferences(supabase, userId);
    const [{ data: missions }, { data: goals }] = await Promise.all([
      supabase.from("missions").select("*").eq("user_id", userId),
      supabase.from("goals").select("*").eq("user_id", userId),
    ]);

    const today = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayMissions = (missions ?? []).filter((m: any) => m.scheduled_date === dateStr);
      const totalMinutes = dayMissions.reduce((acc: number, m: any) => acc + (m.estimated_minutes || 0), 0);
      const completedMinutes = dayMissions
        .filter((m: any) => m.status === "completed")
        .reduce((acc: number, m: any) => acc + (m.estimated_minutes || 0), 0);
      days.push({
        date: dateStr,
        dayName: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][d.getDay()],
        dayNumber: d.getDate(),
        isToday: i === 0,
        missions: dayMissions,
        totalMinutes,
        completedMinutes,
        availableMinutes: preferences.daily_available_minutes,
        hasConflict: totalMinutes > preferences.daily_available_minutes * 1.5,
      });
    }
    return { days, goals: goals ?? [], preferences };
  });

export const rebalancePlanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const { supabase, userId } = context;
    const today = todayStr();
    const { data: overdue } = await supabase
      .from("missions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .lt("scheduled_date", today);

    let rescheduledCount = 0;
    for (const [idx, m] of (overdue ?? []).entries()) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (idx % 3));
      await supabase
        .from("missions")
        .update({ scheduled_date: targetDate.toISOString().split("T")[0], updated_at: now() })
        .eq("id", m.id);
      rescheduledCount++;
    }
    if (rescheduledCount > 0) {
      await logEvent(supabase, userId, "plan_adapted", { rescheduledCount });
    }
    return {
      success: true,
      rescheduledCount,
      message: `${rescheduledCount} missões redistribuídas com equilíbrio pela sua semana.`,
    };
  });

// ========================
// ACTIVITY & METRICS
// ========================

export const getActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const { supabase, userId } = context;
    const [{ data: events }, { data: missions }, { data: goals }] = await Promise.all([
      supabase.from("activity_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("missions").select("status, completed_at").eq("user_id", userId),
      supabase.from("goals").select("status").eq("user_id", userId),
    ]);

    const totalMissions = missions?.length ?? 0;
    const completedMissions = (missions ?? []).filter((m: any) => m.status === "completed").length;
    const pendingMissions = (missions ?? []).filter((m: any) => m.status === "pending").length;
    const completedDates = new Set(
      (missions ?? [])
        .filter((m: any) => m.status === "completed" && m.completed_at)
        .map((m: any) => m.completed_at.split("T")[0])
    );

    return {
      events: events ?? [],
      metrics: {
        totalMissions,
        completedMissions,
        pendingMissions,
        completionRate: totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0,
        activeGoals: (goals ?? []).filter((g: any) => g.status === "active").length,
        completedGoals: (goals ?? []).filter((g: any) => g.status === "completed").length,
        daysActiveCount: completedDates.size,
      },
    };
  });

// ========================
// NOTIFICATIONS
// ========================

export const getNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const { data: notifications } = await context.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return { notifications: notifications ?? [] };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }: { data: { id: string }; context: Ctx }) => {
    await context.supabase
      .from("notifications")
      .update({ read_at: now() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    return { success: true };
  });

// ========================
// SUBSCRIPTION
// ========================

async function getOrCreateSubscription(supabase: any, userId: string) {
  const { data } = await supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  if (data) return data;
  const { data: created } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      status: "active",
      current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
    })
    .select()
    .single();
  return created;
}

export const getSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    return { subscription: await getOrCreateSubscription(context.supabase, context.userId) };
  });

export const toggleSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const { supabase, userId } = context;
    const sub = await getOrCreateSubscription(supabase, userId);
    const { data: updated } = await supabase
      .from("subscriptions")
      .update({ status: sub.status === "active" ? "canceled" : "active", updated_at: now() })
      .eq("id", sub.id)
      .select()
      .single();
    return { subscription: updated };
  });

// ========================
// ASSISTANT
// ========================

export const getConversations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }: { context: Ctx }) => {
    const { data: conversations } = await context.supabase
      .from("conversations")
      .select("*")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    return { conversations: conversations ?? [] };
  });

export const getMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { conversationId: string }) => data)
  .handler(async ({ data, context }: { data: { conversationId: string }; context: Ctx }) => {
    const { supabase, userId } = context;
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", data.conversationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!conversation) throw new Error("Conversa não encontrada.");
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    return { conversation, messages: messages ?? [] };
  });

export const deleteConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { conversationId: string }) => data)
  .handler(async ({ data, context }: { data: { conversationId: string }; context: Ctx }) => {
    await context.supabase
      .from("conversations")
      .delete()
      .eq("id", data.conversationId)
      .eq("user_id", context.userId);
    return { success: true };
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { message: string; conversation_id?: string }) => data)
  .handler(async ({ data, context }: { data: { message: string; conversation_id?: string }; context: Ctx }) => {
    const { supabase, userId } = context;
    const message = (data.message || "").trim();
    if (!message) throw new Error("Mensagem vazia.");

    let conversation: any = null;
    if (data.conversation_id) {
      const { data: found } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", data.conversation_id)
        .eq("user_id", userId)
        .maybeSingle();
      conversation = found;
    }
    if (!conversation) {
      const { data: created } = await supabase
        .from("conversations")
        .insert({
          user_id: userId,
          title: message.slice(0, 32) + (message.length > 32 ? "..." : ""),
        })
        .select()
        .single();
      conversation = created;
    } else {
      await supabase.from("conversations").update({ updated_at: now() }).eq("id", conversation.id);
    }

    const { data: userMessage } = await supabase
      .from("messages")
      .insert({ conversation_id: conversation.id, user_id: userId, role: "user", content: message })
      .select()
      .single();

    const [{ data: profile }, { data: goals }, { data: missions }, preferences] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("goals").select("*").eq("user_id", userId).eq("status", "active"),
      supabase.from("missions").select("*").eq("user_id", userId).eq("status", "pending"),
      getOrCreatePreferences(supabase, userId),
    ]);

    const goalsSummary = (goals ?? [])
      .map((g: any) => `- [${g.category}] "${g.title}" (Resultado pretendido: ${g.desired_outcome})`)
      .join("\n");
    const missionsSummary = (missions ?? [])
      .slice(0, 5)
      .map((m: any) => `- "${m.title}" (${m.estimated_minutes} min, prioridade: ${m.priority})`)
      .join("\n");

    const systemPrompt = `Você é o Assistente Delux, mentor executivo de desenvolvimento pessoal e consistência da plataforma Delux.
Sua missão é ajudar o usuário (${profile?.full_name || ""}) a descomplicar metas e transformá-las em ações práticas imediatas.
Diretrizes:
- Tom de voz: Sofisticado, empático, direto e encorajador (estilo Apple/executive coach).
- Formatação: Use tópicos curtos e parágrafos enxutos. Sem rodeios vazios.
- Estilo preferido do usuário: ${preferences?.assistant_response_style || "progressivo"}.
- Tempo diário disponível: ${preferences?.daily_available_minutes || 30} minutos.
- Metas ativas no momento:\n${goalsSummary || "Nenhuma meta ativa no momento."}
- Próximas missões pendentes:\n${missionsSummary || "Nenhuma missão pendente hoje."}
- Se o usuário pedir para criar um plano ou missão, sugira de forma concreta passos realistas de 15 a 45 minutos.`;

    let assistantContent = await callGemini(`${systemPrompt}\n\nUsuário diz:\n${message}`);
    if (!assistantContent) {
      assistantContent = deterministicAssistantResponse(
        message,
        profile?.full_name || "você",
        goals ?? [],
        missions ?? []
      );
    }

    const { data: assistantMessage } = await supabase
      .from("messages")
      .insert({ conversation_id: conversation.id, user_id: userId, role: "assistant", content: assistantContent })
      .select()
      .single();

    return { conversation, userMessage, assistantMessage };
  });

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: any) => data)
  .handler(async ({ data }: { data: any }) => {
    const { title, current_state, desired_outcome, available_minutes } = data ?? {};
    if (!title) throw new Error("Título do objetivo é obrigatório.");

    let generatedSteps = [
      {
        title: "Etapa 1: Diagnóstico e Primeiros Hábitos",
        description: "Mapear a situação atual, eliminar barreiras e estabelecer rotina mínima.",
        success_criteria: "Completar 7 dias de execução sem interrupção.",
      },
      {
        title: "Etapa 2: Construção da Base Técnica",
        description: "Praticar os fundamentos centrais com repetição deliberada.",
        success_criteria: "Atingir 70% de domínio nas habilidades principais da meta.",
      },
      {
        title: "Etapa 3: Aplicação em Projetos Reais",
        description: "Executar simulações ou projetos práticos com validação de resultados.",
        success_criteria: "Concluir a primeira entrega mensurável pretendida.",
      },
    ];

    let generatedMissions = [
      {
        title: `Sessão de Alinhamento Inicial: ${title}`,
        instructions: "Definir o ambiente de prática, materiais necessários e horário reservado.",
        estimated_minutes: available_minutes || 30,
        priority: "high",
      },
      {
        title: "Prática Deliberada dos Primeiros Fundamentos",
        instructions: "Realizar os primeiros exercícios concentrados anotando dúvidas.",
        estimated_minutes: available_minutes || 30,
        priority: "medium",
      },
    ];

    const prompt = `Crie um plano de ação estruturado para o objetivo "${title}".
Contexto atual informado: "${current_state || "Iniciante"}".
Resultado almejado: "${desired_outcome || title}".
Tempo disponível diário: ${available_minutes || 30} minutos.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "steps": [
    {
      "title": "string curto da etapa",
      "description": "explicação concisa de até 2 linhas",
      "success_criteria": "critério claro de conclusão"
    }
  ],
  "missions": [
    {
      "title": "nome da missão prática",
      "instructions": "instruções objetivas do que executar",
      "estimated_minutes": number,
      "priority": "high" | "medium" | "low"
    }
  ]
}
Forneça exatamente 3 etapas progressivas e 3 missões iniciais práticas.`;

    const text = await callGemini(prompt, true);
    if (text) {
      try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.steps) && parsed.steps.length > 0) generatedSteps = parsed.steps;
        if (Array.isArray(parsed.missions) && parsed.missions.length > 0) generatedMissions = parsed.missions;
      } catch {
        // keep curated plan
      }
    }

    return { steps: generatedSteps, missions: generatedMissions };
  });
