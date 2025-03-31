import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductLink } from "@/components/ui/product-card";
import { getProductDetails, getProductsForSubcategory } from "@/lib/queries";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const runtime = "edge";

export async function generateMetadata(props: {
  params: Promise<{ product: string; category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { product: productParam } = await props.params;
  const urlDecodedProduct = decodeURIComponent(productParam);
  const product = await getProductDetails(urlDecodedProduct);
  if (!product) return notFound();
  return {
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function Page(props: {
  params: Promise<{
    product: string;
    category: string;
    subcategory: string;
  }>;
}) {
  const { product, subcategory, category } = await props.params;
  const urlDecodedProduct = decodeURIComponent(product);
  const urlDecodedSubcategory = decodeURIComponent(subcategory);
  const [productData, relatedUnshifted] = await Promise.all([
    getProductDetails(urlDecodedProduct),
    getProductsForSubcategory(urlDecodedSubcategory),
  ]);
  if (!productData) return notFound();
  const currentProductIndex = relatedUnshifted.findIndex(
    (p) => p.slug === productData.slug,
  );
  const related = [
    ...relatedUnshifted.slice(currentProductIndex + 1),
    ...relatedUnshifted.slice(0, currentProductIndex),
  ];
  return (
    <div className="container p-4">
      <h1 className="border-t-2 pt-1 text-xl font-bold text-accent1">
        {productData.name}
      </h1>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <img
            width={256}
            height={256}
            loading="eager"
            decoding="async"
            alt={`A small picture of ${productData.name}`}
            className="h-56 w-56 flex-shrink-0 border-2 md:h-64 md:w-64"
            src={productData.image_url ?? "/placeholder.svg?height=64&width=64"}
          />
          <p className="flex-grow text-base">{productData.description}</p>
        </div>
        <p className="text-xl font-bold">
          ${parseFloat(productData.price).toFixed(2)}
        </p>
        <AddToCartForm productSlug={productData.slug} />
      </div>
      <div className="pt-8">
        {related.length > 0 && (
          <h2 className="text-lg font-bold text-accent1">
            Explore more products
          </h2>
        )}
        <div className="flex flex-row flex-wrap gap-2">
          {related?.map((product) => (
            <ProductLink
              loading="lazy"
              key={product.name}
              product={product}
              category_slug={category}
              imageUrl={product.image_url}
              subcategory_slug={subcategory}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
