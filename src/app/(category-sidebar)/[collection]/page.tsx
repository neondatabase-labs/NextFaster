import { getCollectionDetails } from "@/lib/queries";
import Link from "next/link";

export default async function Home(props: {
  params: Promise<{
    collection: string;
  }>;
}) {
  const collectionName = decodeURIComponent((await props.params).collection);

  const collections = await getCollectionDetails(collectionName);
  let imageCount = 0;

  return (
    <div className="w-full p-4">
      {collections.map((collection) => (
        <div key={collection.name}>
          <h2 className="text-xl font-semibold">{collection.name}</h2>
          <div className="flex flex-row flex-wrap justify-center gap-2 border-b-2 py-4 sm:justify-start">
            {collection.categories.map((category) => (
              <Link
                prefetch={false}
                key={category.name}
                className="flex w-[125px] flex-col items-center text-center"
                href={`/products/${category.slug}`}
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
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
