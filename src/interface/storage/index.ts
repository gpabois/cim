/// Système de stockage persistent des données.
export interface Storage {
  mkdir(path: string)
  exists(path: string): boolean;
  write(path: string, data: Uint8Array): void;
  read(path: string): Uint8Array

  /// Crée un sous-espace de stockage depuis un certain chemin
  from(path: string): Storage
}
