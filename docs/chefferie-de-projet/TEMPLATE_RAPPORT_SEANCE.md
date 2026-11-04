# Rapport de séance — Prénom Nom

Séance : … · Branche / PR : … · Ticket : … · Relecteur : …

> Viser 30 à 60 lignes utiles, hors extraits nécessaires. L’IA peut préparer ce rapport ; son auteur doit le lire et le corriger avant livraison. Décrire le travail réel, sans journal de prompts, formules commerciales ni répétition du ticket. Ne pas cocher une vérification non effectuée. Aucun secret ou donnée personnelle.

## 1. Résultat et périmètre

- Livré et intégré : …
- Livré mais pas encore intégré : …
- Reporté ou bloqué (P0/P1/P2, raison et prochaine action) : …

## 2. Fonctionnement à connaître

- Point d’entrée et fichiers principaux : …
- Chemin des données en deux ou trois phrases : …
- Décision importante et raison : …
- Contrat consommé/exposé, version ou référence et fixture utilisée : …
- Validation isolée avec doublure ou intégration réelle ; raccordement restant : …

## 3. Exemple concret vérifié

Décrire une entrée, le résultat attendu et le résultat observé. Ajouter un cas limite ou d’erreur et indiquer comment le résultat attendu a été établi.

Exemple pour un calcul : solde 1 500 €, charges restantes 800 €, réserve 200 € → disponible attendu 500 €. Si le solde devient négatif, préciser le comportement retenu et observé.

Pour un composant : props/état initial → action utilisateur → affichage attendu ; erreur réseau → retour à l’état précédent. Pour une CI : commande correcte → succès ; erreur volontaire → contrôle en échec.

## 4. Vérifications réellement exécutées

| Commande ou scénario | Résultat observé                       | Limite / preuve utile                     |
| -------------------- | -------------------------------------- | ----------------------------------------- |
| …                    | Réussi / échoué / bloqué / non exécuté | Résumé, lien CI, capture ou extrait court |

Ne pas confondre compilation, test métier et validation du parcours. Si des tests existent, indiquer combien ont effectivement été exécutés et s’il y a des tests ignorés. Pour une mesure, préciser jeu de données, appareil et conditions. Éviter les logs complets.

## 5. Limites et transmission

- Limite connue ou hypothèse : …
- Action attendue d’un collègue, responsable et interface concernée : … / aucune.
- Étapes de démonstration ou de reproduction : …
- Facultatif, pour la soutenance : une capture ou un résultat mesuré, avec contexte. Identifier toute simulation.

## Relecture par l’auteur

- [ ] J’ai lu le diff et ce rapport ; ils décrivent le même résultat.
- [ ] J’ai vérifié les résultats indiqués et signalé ce qui ne l’est pas.
- [ ] Je peux retrouver le point d’entrée, expliquer l’exemple et montrer un cas d’erreur.

Cette attestation et la génération du document ne remplacent pas la revue croisée ni les preuves d’exécution.
