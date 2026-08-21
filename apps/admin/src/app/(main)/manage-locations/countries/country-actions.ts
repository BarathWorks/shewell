'use server';

import { db } from '@/src/server/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ICountry } from '@/src/_models/country.model';
import { requireAdminSession } from '@/src/server/authz';

export const createCountry = async (data: ICountry) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { name, active, iso3, iso2, phoneCode, currency, currencyName, currencySymbol } = data;

  const FormData = z.object({
    name: z.string().min(1),
    active: z.boolean(),
    iso3: z.string(),
    iso2: z.string(),
    phoneCode: z.string(),
    currency: z.string(),
    currencyName: z.string(),
    currencySymbol: z.string()
  });

  const parsedInput = FormData.safeParse({
    name,
    active,
    iso3,
    iso2,
    phoneCode,
    currency,
    currencyName,
    currencySymbol
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

  await db.country.create({
    data: {
      name,
      active,
      iso3,
      iso2,
      phoneCode,
      currency,
      currencyName,
      currencySymbol
    }
  });

  revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-locations/states');
  return {
    message: 'Country created successfully'
  };
};

export const updateCountry = async (data: ICountry) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const { id, name, active } = data;

  const FormData = z.object({
    id: z.string().min(1),
    name: z.string().min(1)
  });

  const parsedInput = FormData.safeParse({
    id,
    name
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

  await db.country.update({
    where: {
      id: id as string
    },
    data: {
      name
    }
  });

  revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-locations/states');
  return {
    message: 'Country updated successfully'
  };
};

export const updateCountriesStatus = async ({ countryIds, active }: { countryIds: string[]; active: boolean }) => {
  await db.country.updateMany({
    where: {
      id: {
        in: countryIds
      }
    },
    data: {
      active: active
    }
  });

  revalidatePath('/manage-locations/countries');
  revalidatePath('/manage-locations/states');
  return {
    message: 'Countries updated successfully'
  };
};
