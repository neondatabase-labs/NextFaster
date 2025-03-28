import { db, sql as sqlNeon } from "@/db";
import {
  categories,
  collections,
  products,
  subcategories,
  subcollections,
  users,
} from "@/db/schema";
import { and, count, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyToken } from "./session";
import { unstable_cache } from "./unstable-cache";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export const getProductsForSubcategory = unstable_cache(
  (subcategorySlug: string) =>
    db.query.products.findMany({
      where: (products, { eq, and }) =>
        and(eq(products.subcategory_slug, subcategorySlug)),
      // orderBy: (products, { asc }) => asc(products.slug),
    }),
  ["subcategory-products"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCollections = unstable_cache(
  () =>
    sqlNeon`SELECT 
    c.id AS collection_id, 
    c.name AS collection_name, 
    c.slug AS collection_slug, 
    cat.slug AS category_slug, 
    cat.name AS category_name, 
    cat.image_url AS category_image_url
    FROM collections c LEFT JOIN categories cat ON cat.collection_id = c.id;`.then(
      (res) => {
        const collections = res.reduce((acc, row) => {
          const {
            collection_id,
            collection_name,
            collection_slug,
            category_slug,
            category_name,
            category_image_url,
          } = row;
          const collection = acc.find(
            (item: { id: number }) => item.id === collection_id,
          );
          if (collection) {
            collection.categories.push({
              slug: category_slug,
              name: category_name,
              image_url: category_image_url,
            });
          } else {
            acc.push({
              id: collection_id,
              name: collection_name,
              slug: collection_slug,
              categories: category_slug
                ? [
                    {
                      slug: category_slug,
                      name: category_name,
                      image_url: category_image_url,
                    },
                  ]
                : [],
            });
          }
          return acc;
        }, []);
        return collections;
      },
    ),
  ["collections"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCollectionsWithoutCategories = unstable_cache(
  () =>
    db
      .select({ name: collections.name, slug: collections.slug })
      .from(collections),
  ["collectionsWithoutCategory"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getProductDetails = unstable_cache(
  (productSlug: string) =>
    db.query.products.findFirst({
      where: (products, { eq }) => eq(products.slug, productSlug),
    }),
  ["product"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSubcategory = unstable_cache(
  (subcategorySlug: string) =>
    db.query.subcategories.findFirst({
      where: (subcategories, { eq }) => eq(subcategories.slug, subcategorySlug),
    }),
  ["subcategory"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCategory = unstable_cache(
  (categorySlug: string) =>
    db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.slug, categorySlug),
      with: {
        subcollections: {
          with: {
            subcategories: true,
          },
        },
      },
    }),
  ["category"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getCollectionDetails = unstable_cache(
  async (collectionSlug: string) =>
    db.query.collections.findMany({
      with: {
        categories: true,
      },
      where: (collections, { eq }) => eq(collections.slug, collectionSlug),
      // orderBy: (collections, { asc }) => asc(collections.slug),
    }),
  ["collection"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getProductCount = unstable_cache(
  () =>
    sqlNeon`EXPLAIN (FORMAT JSON) select price from "products";`.then((res) => [
      { count: res[0]["QUERY PLAN"][0]["Plan"]["Plan Rows"] },
    ]),
  ["total-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

// could be optimized by storing category slug on the products table
export const getCategoryProductCount = unstable_cache(
  (categorySlug: string) =>
    db
      .select({ count: count(categories.slug) })
      .from(categories)
      .leftJoin(
        subcollections,
        eq(categories.slug, subcollections.category_slug),
      )
      .leftJoin(
        subcategories,
        eq(subcollections.id, subcategories.subcollection_id),
      )
      .leftJoin(products, eq(subcategories.slug, products.subcategory_slug))
      .where(eq(categories.slug, categorySlug)),
  ["category-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSubcategoryProductCount = unstable_cache(
  (subcategorySlug: string) =>
    db
      .select({ count: count(products.slug) })
      .from(products)
      .where(eq(products.subcategory_slug, subcategorySlug)),
  ["subcategory-product-count"],
  {
    revalidate: 60 * 60 * 2, // two hours,
  },
);

export const getSearchResults = unstable_cache(
  async (searchTerm: string) => {
    let results;

    // do we really need to do this hybrid search pattern?

    if (searchTerm.length <= 2) {
      // If the search term is short (e.g., "W"), use ILIKE for prefix matching
      results = await db
        .select()
        .from(products)
        .where(sql`${products.name} ILIKE ${searchTerm + "%"}`) // Prefix match
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    } else {
      // For longer search terms, use full-text search with tsquery
      const formattedSearchTerm = searchTerm
        .split(" ")
        .filter((term) => term.trim() !== "") // Filter out empty terms
        .map((term) => `${term}:*`)
        .join(" & ");

      results = await db
        .select()
        .from(products)
        .where(
          sql`to_tsvector('english', ${products.name}) @@ to_tsquery('english', ${formattedSearchTerm})`,
        )
        .limit(5)
        .innerJoin(
          subcategories,
          sql`${products.subcategory_slug} = ${subcategories.slug}`,
        )
        .innerJoin(
          subcollections,
          sql`${subcategories.subcollection_id} = ${subcollections.id}`,
        )
        .innerJoin(
          categories,
          sql`${subcollections.category_slug} = ${categories.slug}`,
        );
    }

    return results;
  },
  ["search-results"],
  { revalidate: 60 * 60 * 2 }, // two hours
);
