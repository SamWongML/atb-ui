import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

// Translate a BFF NOT_FOUND into a Next 404 for RSC detail/edit pages. A `get({ id })` for
// an unknown entity should render notFound(), not surface a server error; anything else
// rethrows. One helper so every routing-glue page stays a one-liner.
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}
