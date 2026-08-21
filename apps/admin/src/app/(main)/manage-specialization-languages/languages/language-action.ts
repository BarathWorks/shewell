'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IState } from '@/src/_models/state.model';
import { requireAdminSession } from '@/src/server/authz';
interface ILanguage {
  id: string;
  language: string;
  active: boolean;
}
export const createLanguages = async (data: ILanguage) => {
  const session = await requireAdminSession('doctor:write');

  // Restored: this check was commented out, so the action ran for anyone.
  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { language, active } = data;

  const FormData = z.object({
    language: z.string().min(1),

    active: z.boolean()
  });

  const parsedInput = FormData.safeParse({
    language,
    active
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

  await db.professionalLanguages.create({
    data: {
      language: isValidData.language,
      active: isValidData.active
    }
  });

  // revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-specialization-languages/languages');
  return {
    message: 'Languages created successfully'
  };
};

export const updateLanguages = async (data: ILanguage) => {
  const session = await requireAdminSession('doctor:write');

  // Restored: this check was commented out, so the action ran for anyone.
  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, language, active } = data;

  const FormData = z.object({
    id: z.string().min(1),
    language: z.string().min(1),

    active: z.boolean()
  });

  const parsedInput = FormData.safeParse({
    id,
    language,
    active
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

  await db.professionalLanguages.update({
    where: {
      id: id as string
    },
    data: {
      language: isValidData.language,
      active: isValidData.active
    }
  });

  // revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-specialization-languages/languages');
  return {
    message: 'Languages updated successfully'
  };
};

export const deleteLanguages = async (ids: string[]) => {
  const session = await requireAdminSession('doctor:write');

  if (!session) {
    throw new Error('Unauthorised');
  }

  await db.professionalLanguages.deleteMany({
    where: {
      id: {
        in: ids
      }
    }
  });
  revalidatePath('manage-specialization-languages/languages');
};
