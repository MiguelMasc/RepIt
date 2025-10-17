'use server';

import {db} from '@/drizzle/db';
import {auth} from '@clerk/nextjs/server';
import {sql} from 'drizzle-orm';
import {EmbeddingsTable} from '@/drizzle/schema/index';
import {getDashboardMetrics} from './dashboard';
import {getAISessions, AISessionParameters} from './sessions';
import {getGoalHistory} from './goals';

export type RagDoc = {
  id: string;
  type: 'metric' | 'session' | 'goal' | 'supplement' | 'note';
  title: string;
  text: string;
  score?: number;
};

export async function semanticSearch(queryEmbedding: number[], limit = 8) {
  const {userId, redirectToSignIn} = auth();
  if (!userId) {
    redirectToSignIn();
    return [] as {id: string; source_type: string; source_id: string; score: number}[];
  }

  // cosine distance using pgvector: 1 - cosine_similarity
  const rows = await db.execute(
    sql`SELECT id, source_type, source_id, 1 - (embedding <#> ${JSON.stringify(queryEmbedding)}::vector) AS score
        FROM embeddings
        WHERE user_id = ${userId}
        ORDER BY score DESC
        LIMIT ${limit}`,
  );

  // drizzle execute returns driver-specific rows
  // Cast defensively
  return (rows as unknown as {rows?: any[]}).rows ?? [];
}

export async function getStructuredRagDocs(params: AISessionParameters): Promise<RagDoc[]> {
  const {userId, redirectToSignIn} = auth();
  if (!userId) {
    redirectToSignIn();
    return [];
  }

  const [metrics, sessions, goals] = await Promise.all([
    getDashboardMetrics(),
    getAISessions(params),
    getGoalHistory(),
  ]);

  const docs: RagDoc[] = [];
  metrics.kpis.forEach(k => {
    docs.push({id: `kpi:${k.label}`, type: 'metric', title: k.label, text: k.value});
  });

  if (sessions.length > 0) {
    const recent = sessions.slice(0, 3).map(s => ({
      id: `session:${(s as any).name}:${(s as any).date}`,
      type: 'session' as const,
      title: (s as any).name,
      text: `${(s as any).type} on ${new Date((s as any).date).toISOString().split('T')[0]}`,
    }));
    docs.push(...recent);
  }

  const activeGoals = goals.filter(g => !g.completed);
  activeGoals.slice(0, 3).forEach(g => {
    docs.push({
      id: `goal:${g.goal_id}`,
      type: 'goal',
      title: g.title,
      text: `Due ${g.dueDate.toISOString().split('T')[0]}`,
    });
  });

  return docs;
}


