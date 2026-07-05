import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Créer un compte — SkyTrack" };

export default function InscriptionPage() {
  return <AuthForm mode="signup" />;
}
