"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/drizzle";
import { folders, openings, nodeAnnotations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * FOLDER ACTIONS
 */

export async function createFolder(name: string, parentId?: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db.insert(folders).values({
    userId: session.user.id,
    name,
    parentId: parentId || null,
  }).returning();

  return (result as any[])[0];
}

export async function updateFolder(folderId: number, name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const folder = await db.query.folders.findFirst({
    where: and(eq(folders.id, folderId), eq(folders.userId, session.user.id)),
  });

  if (!folder) throw new Error("Folder not found or unauthorized");

  const result = await db.update(folders)
    .set({ name, updatedAt: new Date() })
    .where(eq(folders.id, folderId))
    .returning();

  return result[0];
}

export async function deleteFolder(folderId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const folder = await db.query.folders.findFirst({
    where: and(eq(folders.id, folderId), eq(folders.userId, session.user.id)),
  });

  if (!folder) throw new Error("Folder not found or unauthorized");

  await db.delete(folders).where(eq(folders.id, folderId));
  return { success: true };
}

export async function getUserFolders() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await db.query.folders.findMany({
    where: eq(folders.userId, session.user.id),
  });
}

/**
 * OPENING ACTIONS
 */

export async function createOpening(
  name: string,
  folderId: number | null,
  description?: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const result = await db.insert(openings).values({
    userId: session.user.id,
    folderId: folderId || null,
    name,
    description,
    nodesData: [],
    edgesData: [],
  }).returning();

  return result[0];
}

export async function updateOpening(
  openingId: number,
  data: {
    name?: string;
    description?: string;
    nodesData?: any[];
    edgesData?: any[];
    pgn?: string;
  }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const opening = await db.query.openings.findFirst({
    where: and(eq(openings.id, openingId), eq(openings.userId, session.user.id)),
  });

  if (!opening) throw new Error("Opening not found or unauthorized");

  const result = await db.update(openings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(openings.id, openingId))
    .returning();

  return result[0];
}

export async function deleteOpening(openingId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const opening = await db.query.openings.findFirst({
    where: and(eq(openings.id, openingId), eq(openings.userId, session.user.id)),
  });

  if (!opening) throw new Error("Opening not found or unauthorized");

  await db.delete(openings).where(eq(openings.id, openingId));
  return { success: true };
}

export async function getUserOpenings(folderId?: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (folderId) {
    return await db.query.openings.findMany({
      where: and(eq(openings.userId, session.user.id), eq(openings.folderId, folderId)),
    });
  }

  return await db.query.openings.findMany({
    where: eq(openings.userId, session.user.id),
  });
}

export async function getOpening(openingId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await db.query.openings.findFirst({
    where: and(eq(openings.id, openingId), eq(openings.userId, session.user.id)),
  });
}

/**
 * NODE ANNOTATION ACTIONS
 */

export async function saveNodeAnnotation(
  openingId: number,
  nodeId: string,
  data: {
    notes?: string;
    color?: string;
    arrowsData?: any[];
    squaresData?: any[];
  }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const opening = await db.query.openings.findFirst({
    where: and(eq(openings.id, openingId), eq(openings.userId, session.user.id)),
  });

  if (!opening) throw new Error("Opening not found or unauthorized");

  // Check if annotation exists
  const existing = await db.query.nodeAnnotations.findFirst({
    where: and(eq(nodeAnnotations.openingId, openingId), eq(nodeAnnotations.nodeId, nodeId)),
  });

  if (existing) {
    const result = await db.update(nodeAnnotations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(nodeAnnotations.openingId, openingId), eq(nodeAnnotations.nodeId, nodeId)))
      .returning();
    return result[0];
  }

  const result = await db.insert(nodeAnnotations).values({
    openingId,
    nodeId,
    ...data,
  }).returning();

  return result[0];
}

export async function getNodeAnnotation(openingId: number, nodeId: string) {
  const session = await auth.api.getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const opening = await db.query.openings.findFirst({
    where: and(eq(openings.id, openingId), eq(openings.userId, session.user.id)),
  });

  if (!opening) throw new Error("Opening not found or unauthorized");

  return await db.query.nodeAnnotations.findFirst({
    where: and(eq(nodeAnnotations.openingId, openingId), eq(nodeAnnotations.nodeId, nodeId)),
  });
}

export async function getOpeningAnnotations(openingId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const opening = await db.query.openings.findFirst({
    where: and(eq(openings.id, openingId), eq(openings.userId, session.user.id)),
  });

  if (!opening) throw new Error("Opening not found or unauthorized");

  return await db.query.nodeAnnotations.findMany({
    where: eq(nodeAnnotations.openingId, openingId),
  });
}
