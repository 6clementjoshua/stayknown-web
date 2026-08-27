import type { Metadata } from "next";
import UpdatesAdminClient from "@/components/updates-admin/UpdatesAdminClient";
export const metadata: Metadata = {
  title: "StayKnown Updates Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};
export default function Page() {
  return <UpdatesAdminClient />;
}
