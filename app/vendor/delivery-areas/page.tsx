import { redirect } from "next/navigation";

/** Delivery PINs are managed in the admin panel. */
export default function Page() {
  redirect("/vendor");
}
