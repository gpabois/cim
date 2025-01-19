import i18n from "i18next";
import fr from './fr.json';
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({ resources: { fr }, lng: "fr" });

export default i18n;
