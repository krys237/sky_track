import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileFromMetadata } from "@/lib/profile";
import { AccountForm } from "@/components/account/AccountForm";

export const metadata: Metadata = { title: "Mon compte — SkyTrack" };

export default async function ComptePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const profile = profileFromMetadata(user.user_metadata);
  return <AccountForm email={user.email ?? ""} initial={profile} />;
}
