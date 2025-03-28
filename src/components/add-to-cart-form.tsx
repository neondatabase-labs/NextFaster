"use client";
import { addToCart } from "@/lib/actions";
import { useActionState } from "react";

export function AddToCartForm({ productSlug }: { productSlug: string }) {
  const [message, formAction, isPending] = useActionState(addToCart, null);
  return (
    <form className="flex flex-col gap-2" action={formAction}>
      <input type="hidden" name="productSlug" value={productSlug} />
      <button
        type="submit"
        className="max-w-[150px] rounded-[2px] bg-accent1 px-5 py-1 text-sm font-semibold text-white"
      >
        Add to cart
      </button>
      {isPending && <p>Adding to cart...</p>}
      {!isPending && message && <p>{message}</p>}
    </form>
  );
}
