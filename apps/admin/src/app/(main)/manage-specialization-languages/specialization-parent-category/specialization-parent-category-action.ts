'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IState } from '@/src/_models/state.model';
import { requireAdminSession } from '@/src/server/authz';
interface ISpecialization {
  id: string;
  name: string;
  active: boolean;
  mediaId: string;
}
export const createSpecialisation = async (data: ISpecialization) => {
  const session = await requireAdminSession('doctor:write');

  if (!session) {
    throw new Error('Unauthorised');
  }

  const { name, active, mediaId } = data;

  const FormData = z.object({
    name: z.string().min(1),

    active: z.boolean(),
    mediaId: z.string()
  });

  const parsedInput = FormData.safeParse({
    name,
    active,
    mediaId
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

 try{
  await db.professionalSpecializationParentCategory.create({
    data: {
      name: isValidData.name,
      active: isValidData.active,
      mediaId: isValidData.mediaId 
    }
  });

  //   await db.professionalSpecializations.create({
  //     data: {
  //       specialization: isValidData.specialization,
  //       active: isValidData.active
  //     }
  //   });

  // revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-specialization-languages/specialization-parent-category');
  return {
    message: 'Specialization Parent Category created successfully'
  };
 }
 catch(error){
  return {
    error : "Specialization Parent Category cannot be created"
  }
 }
};

export const updateSpecialisation = async (data: ISpecialization) => {
  const session = await requireAdminSession('doctor:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, name, active, mediaId } = data;

  const FormData = z.object({
    id: z.string().min(1),
    name: z.string().min(1),

    active: z.boolean(),
    mediaId: z.string()
  });

  const parsedInput = FormData.safeParse({
    id,
    name,
    active,
    mediaId
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

 try{
  await db.professionalSpecializationParentCategory.update({
    where: {
      id: id as string
    },
    data: {
      name: isValidData.name,
      active: isValidData.active,
      mediaId: isValidData.mediaId
    }
  });
  //   await db.professionalSpecializations.update({
  //     where: {
  //       id: id as string
  //     },
  //     data: {
  //       specialization: isValidData.specialization,
  //       active: isValidData.active
  //     }
  //   });

  // revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-specialization-languages/specialization-parent-category');
  return {
    message: 'Specialization Parent Category updated successfully'
  };
}
catch(error){
  return{
    error : "Specialization Parent Category not updated"
  }
}

 }

export const deleteSpecializations = async (ids: string[]) => {
  const session = await requireAdminSession('doctor:write');

  if (!session) {
    throw new Error('Unauthorised');
  }

  //   await db.professionalSpecializations.deleteMany({
  //     where: {
  //       id: {
  //         in: ids
  //       }
  //     }

  //   });
 try{
  await db.professionalSpecializationParentCategory.deleteMany({
    where: {
      id: {
        in: ids
      }
    }
  });
  revalidatePath('manage-specialization-languages/specialization-parent-category');
 
 }
 catch(error){
  return{
    error : "Specialization Parent Category not deleted"
  }
 }
};
