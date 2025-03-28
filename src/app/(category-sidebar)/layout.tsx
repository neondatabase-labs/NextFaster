import { getCollectionsWithoutCategories } from "@/lib/queries";
import Link from "next/link";
import { Suspense } from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-grow font-mono">
      <aside className="fixed left-0 hidden w-64 min-w-64 max-w-64 overflow-y-auto border-r p-4 md:block">
        <h2 className="border-b border-accent1 text-sm font-semibold text-accent1">
          Choose a Category
        </h2>
        <Suspense fallback={<div>Loading categories...</div>}>
          <Categories />
        </Suspense>
      </aside>
      <main
        id="main-content"
        className="min-h-[calc(100vh-113px)] flex-1 overflow-y-auto p-4 pt-0 md:pl-64"
      >
        {children}
      </main>
    </div>
  );
}

async function Categories() {
  const allCollections = await getCollectionsWithoutCategories();
  return (
    <ul className="flex flex-col items-start justify-center">
      {allCollections.map((collection) => (
        <Link
          prefetch={false}
          key={collection.slug}
          href={`/${collection.slug}`}
          className="block w-full py-1 text-xs text-gray-800 hover:bg-accent2 hover:underline"
        >
          {collection.name}
        </Link>
      ))}
    </ul>
  );
}
