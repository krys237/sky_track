import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Connexion — SkyTrack" };

export default function ConnexionPage() {
  return <AuthForm mode="signin" />;
}
