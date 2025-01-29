import { ControleData } from "@shared/model/controle";
import { None, Optional } from "@shared/option";
import { createContext } from "react";

export const ControleContext = createContext<Optional<{onUpdate: () => void} & ControleData>>(None);
export const PointDeControleAirContext = createContext<Optional<{id: number}>>(None);
