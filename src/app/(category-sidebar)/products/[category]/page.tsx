import { getCategory, getCategoryProductCount } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page(props: {
  params: Promise<{
    category: string;
  }>;
}) {
  const { category } = await props.params;
  const urlDecoded = decodeURIComponent(category);
  const cat = await getCategory(urlDecoded);
  if (!cat) {
    return notFound();
  }

  const countRes = await getCategoryProductCount(urlDecoded);

  const finalCount = countRes[0]?.count;

  return (
    <div className="container p-4">
      {finalCount && (
        <h1 className="mb-2 border-b-2 text-sm font-bold">
          {finalCount} {finalCount === 1 ? "Product" : "Products"}
        </h1>
      )}
      <div className="space-y-4">
        {cat.subcollections.map((subcollection, index) => (
          <div key={index}>
            <h2 className="mb-2 border-b-2 text-lg font-semibold">
              {subcollection.name}
            </h2>
            <div className="flex flex-row flex-wrap gap-2">
              {subcollection.subcategories.map(
                (subcategory, subcategoryIndex) => (
                  <Link
                    prefetch={false}
                    key={subcategoryIndex}
                    className="group flex h-full w-full flex-row gap-2 border px-4 py-2 hover:bg-gray-100 sm:w-[200px]"
                    href={`/products/${category}/${subcategory.slug}`}
                  >
                    <div className="py-2">
                      <img
                        width={48}
                        height={48}
                        loading="eager"
                        decoding="async"
                        alt={`A small picture of ${subcategory.name}`}
                        className="h-12 w-12 flex-shrink-0 object-cover"
                        src={subcategory.image_url ?? "/placeholder.svg"}
                      />
                    </div>
                    <div className="flex h-16 flex-grow flex-col items-start py-2">
                      <div className="text-sm font-medium text-gray-700 group-hover:underline">
                        {subcategory.name}
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
