'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IState } from '@/src/_models/state.model';
import { requireAdminSession } from '@/src/server/authz';
interface ISpecialization {
  id: string;
  specialization: string;
  active: boolean;
  categoryId : string
}
export const createSpecialisation = async (data: ISpecialization) => {
  const session = await requireAdminSession('doctor:write');

  if (!session) {
   throw new Error("Unauthorised")
  }

  const { specialization, active, categoryId } = data;

  const FormData = z.object({
    specialization: z.string().min(1),

    active: z.boolean(),
    categoryId : z.string().optional()
  });

  const parsedInput = FormData.safeParse({
    specialization,
    active,
    categoryId
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

  await db.professionalSpecializations.create({
    data: {
      specialization: isValidData.specialization,
      active: isValidData.active,
      professionalSpecializationParentCategoryId : isValidData.categoryId || null
    }
  });

  // revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-specialization-languages/specializations');
  return {
    message: 'Specialization created successfully'
  };
};

export const updateSpecialisation = async (data: ISpecialization) => {
  const session = await requireAdminSession('doctor:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, specialization, active, categoryId } = data;

  const FormData = z.object({
    id: z.string().min(1),
    specialization: z.string().min(1),

    active: z.boolean(),
    categoryId : z.string().optional()
  });

  const parsedInput = FormData.safeParse({
    id,
    specialization,
    active,
    categoryId
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

  await db.professionalSpecializations.update({
    where: {
      id: id as string
    },
    data: {
      professionalSpecializationParentCategoryId : isValidData.categoryId || null,
      specialization: isValidData.specialization,
      active: isValidData.active
      
    }
  });

  // revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-specialization-languages/specializations');
  return {
    message: 'Specialization updated successfully'
  };
};

export const deleteSpecializations = async (ids: string[]) => {
  const session = await requireAdminSession('doctor:write');

  if (!session) {
    throw new Error('Unauthorised');
  }

  await db.professionalSpecializations.deleteMany({
    where: {
      id: {
        in: ids
      }
    }
   
  });
  revalidatePath("manage-specialization-languages/specializations")
};
