import { getCollections, getProductCount } from "@/lib/queries";
import Link from "next/link";
import { Suspense } from "react";

export default async function Home() {
  return (
    <div className="w-full p-4">
      <Suspense fallback={<div>Loading...</div>}>
        {/* Await productCount inside Suspense */}
        <ProductCount />
        {/* Await collections inside Suspense */}
        <Collections />
      </Suspense>
    </div>
  );
}

async function ProductCount() {
  const productCount = await getProductCount();
  return (
    <div className="mb-2 w-full flex-grow border-b-[1px] border-accent1 text-sm font-semibold text-black">
      Explore {productCount.at(0)?.count.toLocaleString()} products
    </div>
  );
}

async function Collections() {
  const collections = await getCollections();
  let imageCount = 0;

  return (
    <>
      {collections.map(
        (collection: {
          name: string;
          slug: string;
          categories: { name: string; slug: string; image_url?: string }[];
        }) => (
          <div key={collection.name}>
            <h2 className="text-xl font-semibold">{collection.name}</h2>
            <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
              {collection.categories.map(
                (category: {
                  name: string;
                  slug: string;
                  image_url?: string;
                }) => (
                  <Link
                    prefetch={false}
                    key={category.name}
                    href={`/products/${category.slug}`}
                    className="flex w-[125px] flex-col items-center text-center"
                  >
                    <img
                      width={48}
                      height={48}
                      decoding="async"
                      alt={`A small picture of ${category.name}`}
                      loading={imageCount++ < 15 ? "eager" : "lazy"}
                      src={category.image_url ?? "/placeholder.svg"}
                      className="mb-2 h-14 w-14 border hover:bg-accent2"
                    />
                    <span className="text-xs">{category.name}</span>
                  </Link>
                ),
              )}
            </div>
          </div>
        ),
      )}
    </>
  );
}
