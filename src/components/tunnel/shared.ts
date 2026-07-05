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
