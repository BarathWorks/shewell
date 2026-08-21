'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IStateForm } from '@/src/_models/state.model';
import { requireAdminSession } from '@/src/server/authz';
import { recordAudit } from '@/src/server/audit';

/**
 * State CRUD.
 *
 * This whole feature was inert: the table component was commented out, so the page
 * ran two queries and rendered nothing. The actions behind it were worse than
 * inert — `createState` wrote `countryId: ''`, a foreign key pointing at no
 * country, which the database rejects outright; and `deleteState` hard-deleted
 * rows even though `State` is soft-deletable and the page filters on
 * `deletedAt: null`.
 *
 * `State` is referenced by qualifications, cities and professional addresses, so a
 * hard delete could orphan a practitioner's address. Deletion is now soft, and
 * refuses when a state is still in use.
 */

const STATE_PATH = '/manage-locations/states';

const stateFields = {
  name: z.string().trim().min(1, 'Name is required'),
  stateCode: z.string().trim().min(1, 'State code is required'),
  countryId: z.string().min(1, 'Country is required')
};

/** The country must exist — the FK would otherwise fail at the database with an opaque error. */
async function countryExists(countryId: string) {
  const country = await db.country.findFirst({
    where: { id: countryId },
    select: { id: true }
  });
  return Boolean(country);
}

export const createState = async (data: IStateForm) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const parsedInput = z.object(stateFields).safeParse({
    name: data.name,
    stateCode: data.stateCode,
    countryId: data.countryId
  });

  if (!parsedInput.success) {
    return {
      error: 'Invalid data',
      details: parsedInput.error.flatten().fieldErrors
    };
  }

  const isValidData = parsedInput.data;

  if (!(await countryExists(isValidData.countryId))) {
    return { error: 'Selected country no longer exists' };
  }

  const state = await db.state.create({
    data: {
      name: isValidData.name,
      stateCode: isValidData.stateCode,
      countryId: isValidData.countryId
    }
  });

  await recordAudit({
    actor: session,
    action: 'state.created',
    entity: 'State',
    entityId: state.id,
    summary: `State ${state.name} created`
  });

  revalidatePath(STATE_PATH);
  return { message: 'State created successfully' };
};

export const updateState = async (data: IStateForm) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const parsedInput = z.object({ id: z.string().min(1), ...stateFields }).safeParse({
    id: data.id,
    name: data.name,
    stateCode: data.stateCode,
    countryId: data.countryId
  });

  if (!parsedInput.success) {
    return {
      error: 'Invalid data',
      details: parsedInput.error.flatten().fieldErrors
    };
  }

  const isValidData = parsedInput.data;

  if (!(await countryExists(isValidData.countryId))) {
    return { error: 'Selected country no longer exists' };
  }

  // Scoped to a live row so an already-deleted state cannot be silently resurrected.
  const existing = await db.state.findFirst({
    where: { id: isValidData.id, deletedAt: null },
    select: { id: true }
  });

  if (!existing) {
    return { error: 'State not found' };
  }

  await db.state.update({
    where: { id: existing.id },
    data: {
      name: isValidData.name,
      stateCode: isValidData.stateCode,
      countryId: isValidData.countryId
    }
  });

  await recordAudit({
    actor: session,
    action: 'state.updated',
    entity: 'State',
    entityId: existing.id,
    summary: `State ${isValidData.name} updated`
  });

  revalidatePath(STATE_PATH);
  return { message: 'State updated successfully' };
};

export const deleteState = async (ids: string[]) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return { error: 'Unauthorized' };
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return { error: 'No states selected' };
  }

  // A state still attached to an address, city or qualification cannot be removed
  // without leaving those records pointing at nothing.
  const inUse = await db.state.findMany({
    where: {
      id: { in: ids },
      deletedAt: null,
      OR: [
        { cities: { some: {} } },
        { professionalAddresses: { some: {} } },
        { qualifications: { some: {} } }
      ]
    },
    select: { name: true }
  });

  if (inUse.length > 0) {
    return {
      error: `Still in use and cannot be deleted: ${inUse.map((s) => s.name).join(', ')}`
    };
  }

  const result = await db.state.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date() }
  });

  await recordAudit({
    actor: session,
    action: 'state.deleted',
    entity: 'State',
    summary: `${result.count} state(s) deleted`,
    metadata: { ids }
  });

  revalidatePath(STATE_PATH);
  return { message: `${result.count} state(s) deleted` };
};
