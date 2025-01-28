import { None, Optional } from "@shared/option";
import { createContext } from "react";

export const ControleAirContext = createContext<Optional<{id: string, onUpdate: () => void}>>(None);
export const PointDeControleAirContext = createContext<Optional<{id: number}>>(None);
