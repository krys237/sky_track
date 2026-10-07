import type React from "react";
import type { Flow, OS } from "@/lib/types";

export type SetFlow = React.Dispatch<React.SetStateAction<Flow>>;

export interface StepProps {
  flow: Flow;
  setFlow: SetFlow;
  next: () => void;
  back: () => void;
}

export interface SetupProps extends StepProps {
  detectedOS: OS | null;
}

/**
 * État constaté côté serveur lors d'une reprise de commande (page rechargée
 * pendant l'attente de paiement) : `initiee` = re-sonder, `echouee` = afficher
 * l'échec et permettre une nouvelle tentative.
 */
export type ResumeStatus = "initiee" | "echouee";

export interface StepPayProps extends StepProps {
  resumeStatus?: ResumeStatus | null;
}
