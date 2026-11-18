/**
 * Point de raccordement vers le fournisseur de session commun (Yann).
 * Tant qu'il n'existe pas, aucun jeton n'est disponible et la source API reste en erreur explicite :
 * le dashboard ne simule jamais une session et n'envoie aucun identifiant choisi par le navigateur.
 */
export async function getAccessToken(): Promise<string | null> {
  return null;
}
