'use server';

import {z} from 'zod';
import {db} from '@/drizzle/db';
import {auth} from '@clerk/nextjs/server';
import {v4 as uuidv4} from 'uuid';
import {UserNotesTable} from '@/drizzle/schema/index';
import {eq} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';

export const noteFormSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
});

export type UserNote = {
  id: string;
  user_id: string;
  title?: string | null;
  content: string;
  created_at: Date;
  updated_at: Date;
};

export async function getNotes(): Promise<UserNote[]> {
  const {userId, redirectToSignIn} = auth();
  if (!userId) {
    redirectToSignIn();
    return [];
  }
  const notes = await db.query.UserNotesTable.findMany({
    where: ({user_id}, {eq}) => eq(user_id, userId),
    orderBy: ({created_at}, {desc}) => desc(created_at),
  });
  return notes;
}

export async function createNote(dirty: z.infer<typeof noteFormSchema>) {
  const {userId, redirectToSignIn} = auth();
  if (!userId) {
    redirectToSignIn();
    return {error: true};
  }
  const {success, data} = noteFormSchema.safeParse(dirty);
  if (!success) return {error: true};

  await db
    .insert(UserNotesTable)
    .values({
      id: uuidv4(),
      user_id: userId,
      title: data.title ?? null,
      content: data.content,
    })
    .returning();

  revalidatePath('/');
  return undefined;
}

export async function deleteNote(id: string) {
  const {userId, redirectToSignIn} = auth();
  if (!userId) {
    redirectToSignIn();
    return {error: true};
  }
  await db.delete(UserNotesTable).where(eq(UserNotesTable.id, id));
  revalidatePath('/');
  return undefined;
}


