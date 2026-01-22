'use server';

import { db } from '@/src/server/db';
import { ProductCategory } from '@repo/database';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { IMediaOnProducts, IProductForm } from '@/src/_models/product.model';
import { getServerSession } from 'next-auth';

const checkSlug = async (slug: string, id: string | null = null) => {
  if (id) {
    const product = await db.product.findFirst({
      select: {
        id: true
      },
      where: {
        NOT: {
          id: id
        },
        deletedAt: null,
        slug
      }
    });

    return !!product;
  }

  const product = await db.product.findFirst({
    where: {
      slug,
      deletedAt: null
    }
  });

  return !!product;
};

export const createProduct = async (data: IProductForm) => {
  console.log('data', data);
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  const { name, description, shortDescription, slug, seoTitle, seoDescription, seoKeywords, categoryId, bestSeller, active, productVariants, faq, productBenefits } = data;

  const FormData = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    shortDescription: z.string().min(1),
    active: z.boolean().optional(),
    bestseller: z.boolean().optional(),
    categoryId: z.string(),

    slug: z.string(),
    seoTitle: z.string().nullable(),
    seoDescription: z.string().nullable(),
    seoKeywords: z.array(z.string()),
    productBenefits: z.array(z.object({ benefit: z.string() })).optional(),
    productVariants: z
      .array(
        z.object({
          name: z.string(),
          priceInCents: z.number().min(1),
          discountInCents: z.number().min(1).nullable(),
          discountInPercentage: z.number().min(0).max(100).nullable(),
          discountEndDate: z.date().nullable()
        })
      )
      .min(1, 'Minimum 1 variant needs to be added.'),
    // productStats: z
    //   .array(
    //     z.object({
    //       title: z.string(),
    //       stat: z.string()
    //     })
    //   )
    //   .optional(),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
        order: z.number()
      })
    )
    // password: z.string().min(8).nullable()
  });

  const isValidData = FormData.parse({
    name,
    slug,
    seoTitle,
    seoDescription,
    seoKeywords,
    description,
    shortDescription,
    active,
    bestSeller,
    categoryId,
    productBenefits,
    productVariants,
    // productStats,
    faq
  });

  if (!isValidData) {
    return {
      error: 'Invalid data'
    };
  }

  if (await checkSlug(slug)) {
    return {
      error: 'Slug already exists'
    };
  }
  console.log('active', active);
  await db.product.create({
    data: {
      name: name as string,
      slug: slug.toLowerCase() as string,
      description,
      shortDescription,
      active,
      bestSeller,
      categoryId,
      seoTitle,
      seoDescription,
      seoKeywords,
      avgRating: 0,
      totalReviews: 0,
      productBenefits: {
        create: productBenefits.map((p) => ({ benefit: p.benefit }))
      },
      productVariants: {
        create: productVariants.map((variant) => ({
          name: variant.name,
          priceInCents: variant.priceInCents * 100,
          discountInCents: variant.discountInCents && variant.discountInCents * 100,
          discountInPercentage: variant.discountInPercentage,
          discountEndDate: variant.discountEndDate
        }))
      },
      // productStats: {
      //   create: productStats.map((stat) => ({
      //     title: stat.title,
      //     stat: stat.stat
      //   }))
      // },
      faq: {
        create: faq.map((f) => ({
          question: f.question,
          answer: f.answer,
          order: f.order
        }))
      }
    }
  });

  revalidatePath('/manage-products/products');
  return {
    message: 'Product created successfully',
    id: await db.product.findFirst({
      select: { id: true },
      where: { slug: slug.toLowerCase() }
    }).then(p => p?.id)
  };
};

export const updateProduct = async (data: IProductForm) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  const { id, name, description, shortDescription, slug, seoTitle, seoDescription, seoKeywords, categoryId, bestSeller, active, productVariants, faq,productBenefits } = data;

  const FormData = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().min(1),
    shortDescription: z.string().min(1),
    active: z.boolean().optional(),
    bestSeller: z.boolean().optional(),
    categoryId: z.string(),

    slug: z.string(),
    seoTitle: z.string().nullable(),
    seoDescription: z.string().nullable(),
    seoKeywords: z.array(z.string()),
    productBenefits: z.array(z.object({ benefit: z.string() })).optional(),
    productVariants: z
      .array(
        z.object({
          name: z.string(),
          priceInCents: z.number().min(1),
          discountInCents: z.number().min(1).nullable(),
          discountInPercentage: z.number().min(0).max(100).nullable(),
          discountEndDate: z.date().nullable()
        })
      )
      .min(1, 'Minimum 1 variant needs to be added.'),
    // productStats: z
    //   .array(
    //     z.object({
    //       title: z.string(),
    //       stat: z.string()
    //     })
    //   )
    //   .optional(),
    faq: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
        order: z.number()
      })
    )
    // password: z.string().min(8).nullable()
  });

  const isValidData = FormData.parse({
    id,
    name,
    slug,
    seoTitle,
    seoDescription,
    seoKeywords,
    description,
    shortDescription,
    active,
    bestSeller,
    categoryId,
    productBenefits,
    productVariants,
    // productStats,
    faq
  });

  if (!isValidData) {
    return {
      error: 'Invalid data'
    };
  }

  if (await checkSlug(slug, id)) {
    return {
      error: 'Slug already exists'
    };
  }

  db.$transaction(async (tx) => {
    await tx.productStats.updateMany({
      where: {
        productId: id
      },
      data: {
        deletedAt: new Date()
      }
    });
    await tx.productVariant.updateMany({
      where: {
        productId: id
      },
      data: {
        deletedAt: new Date()
      }
    });
    await tx.productBenefit.updateMany({
      where: {
        productId: id
      },
      data: {
        deletedAt: new Date()
      }
    });

    await tx.fAQ.deleteMany({
      where : {
        productId : id
      }
    })

    await tx.product.update({
      where: { id: id },
      data: {
        name: name as string,
        description,
        shortDescription,
        active,
        bestSeller,
        categoryId,
        slug,
        seoTitle,
        seoDescription,
        seoKeywords,

        productBenefits: {
          create: productBenefits.map((p) => ({ benefit: p.benefit }))
        },
        productVariants: {
          create: productVariants.map((variant) => {
            return {
              name: variant.name,
              priceInCents: variant.priceInCents * 100,
              discountInCents: variant.discountInCents ? variant.discountInCents * 100 : null,
              discountInPercentage: variant.discountInPercentage,
              discountEndDate: variant.discountEndDate
            };
          })
        },
        // productStats: {
        //   create: productStats.map((stat) => ({
        //     title: stat.title,
        //     stat: stat.stat
        //   }))
        // },
        // create new FAQ
        faq :{
          create: faq.map((f) => ({
            question : f.question,
            answer : f.answer,
            order : f.order
          }))
        }
      }
    });
  });

  revalidatePath('/manage-products/products');
  return {
    message: 'Product updated successfully'
  };
};

export const deleteProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId
    }
  });

  // if (product?.categoryId) {
  //   return {
  //     error: 'Cannot delete product as it is assosiated with category'
  //   };
  // }
  try {
    await db.product.update({
      data: {
        deletedAt: new Date()
      },
      where: {
        id: productId
      }
    });
    revalidatePath('/manage-products/products');
    return {
      message: 'Product deleted successfully'
    };
  } catch (err) {
    return {
      error: 'Error in deleting product'
    };
  }
};

export const updateProductImages = async (data: IMediaOnProducts[], id: string) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  try {
    db.$transaction(async (tx) => {
      await tx.mediaOnProducts.deleteMany({
        where: {
          productId: id,
          mediaId: {
            notIn: data.map((d) => d.mediaId)
          }
        }
      });

      await tx.mediaOnProducts.createMany({
        data: data.map((image) => ({
          productId: id,
          mediaId: image.mediaId,
          order: image.order,
          imageAltText: image.imageAltText,
          comment: image.comment
        }))
      });
    });

    revalidatePath('/manage-products/products');
    return {
      message: 'Product images updated successfully'
    };
  } catch (e) {
    return {
      error: 'Something went wrong while saving images.'
    };
  }
};
