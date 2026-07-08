import { redirect } from "next/navigation";

// The root sends to the Overview home (README.md §Overview).
export default function RootPage() {
  redirect("/overview");
}
