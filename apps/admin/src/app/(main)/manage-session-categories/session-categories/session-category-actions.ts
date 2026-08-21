'use server';

import { ISessionCategory } from '@/src/_models/session-category.model';
import { db } from '@/src/server/db';
import { Trimester } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdminSession } from '@/src/server/authz';

export const createSessionCategory = async (data: ISessionCategory) => {
    const session = await requireAdminSession('session:write');

    if (!session) {
        return {
            error: 'Unauthorized'
        };
    }

    const { name, slug, trimester } = data;
    const Schema = z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        trimester: z.nativeEnum(Trimester),
    });

    const parsedInput = Schema.safeParse({
        name,
        slug,
        trimester,
    });

  if (!parsedInput.success) {
    return {
      error: 'Invalid data',
      details: parsedInput.error.flatten().fieldErrors
    };
  }

  // Downstream code reads these fields directly, so expose the parsed data under
  // the original name rather than rewriting every reference.
  const isValidData = parsedInput.data;

    try {
        await db.sessionCategory.create({
            data: {
                name,
                slug,
                trimester,
            }
        });

        revalidatePath('/admin/manage-session-categories/session-categories');
        return {
            message: 'Session Category added successfully'
        };
    } catch (error: any) {
        console.error("Error creating session category:", error);
        if (error.code === 'P2002') { // Prisma unique constraint violation
            return { error: 'Slug must be unique.' };
        }
        return {
            error: 'Failed to create session category'
        };
    }
};

export const updateSessionCategory = async (data: ISessionCategory) => {
    const session = await requireAdminSession('session:write');

    if (!session) {
        return {
            error: 'Unauthorized'
        };
    }

    const { id, name, slug, trimester } = data;

    if (!id) {
        return { error: "ID is required for update" };
    }

    const Schema = z.object({
        name: z.string().min(1),
        slug: z.string().min(1),
        trimester: z.nativeEnum(Trimester),
    });

    const parsedInput = Schema.safeParse({
        name,
        slug,
        trimester,
    });

  if (!parsedInput.success) {
    return {
      error: 'Invalid data',
      details: parsedInput.error.flatten().fieldErrors
    };
  }

  // Downstream code reads these fields directly, so expose the parsed data under
  // the original name rather than rewriting every reference.
  const isValidData = parsedInput.data;

    try {
        await db.sessionCategory.update({
            where: {
                id: id
            },
            data: {
                name,
                slug,
                trimester,
            }
        });

        revalidatePath('/admin/manage-session-categories/session-categories');
        return {
            message: 'Session Category updated successfully'
        };
    } catch (error: any) {
        console.error("Error updating session category:", error);
        if (error.code === 'P2002') {
            return { error: 'Slug must be unique.' };
        }
        return {
            error: 'Failed to update session category'
        };
    }
};

export const deleteSessionCategory = async (ids: string[]) => {
    const session = await requireAdminSession('session:write');
    if (!session) {
        return {
            error: "Unauthorised"
        }
    }
    try {
        await db.sessionCategory.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        })
        revalidatePath("/admin/manage-session-categories/session-categories")
        return {
            message: "Session Categories deleted successfully"
        }
    }
    catch (e) {
        console.error("Error deleting session category:", e);
        return {
            error: "Session Categories deletion error"
        }
    }
}
