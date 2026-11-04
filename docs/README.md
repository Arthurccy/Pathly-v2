# Documentation Pathly V2

## Point d’entrée de l’équipe et des agents IA

Contexte : projet pédagogique de deuxième année de master, réalisé en alternance par neuf personnes, en onze séances de six heures. Le développement assisté par IA fait partie du fonctionnement prévu. Les ambitions sont celles d’un démonstrateur financier sérieux, avec un périmètre livré et vérifié à chaque séance.

| Catégorie                  | Document de référence                                                                                      | Usage                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Produit                    | [Vision et périmètre](VISION_PRODUIT.md)                                                                   | Comprendre l’utilisateur, l’ambition et les limites |
| Organisation               | [Guide de contribution](../CONTRIBUTING.md)                                                                | Travailler, tester, faire relire et rendre          |
| Planification              | [Roadmap collective](chefferie-de-projet/ROADMAP_GLOBALE_11_SEANCES.md)                                    | Comprendre la progression des onze séances          |
| Planification individuelle | [Missions S3 à S11](chefferie-de-projet/MISSIONS_PAR_SEANCE.md)                                            | Trouver le travail prévu pour chaque membre         |
| Séance active              | [Briefing S2](BRIEFING_SEANCE_POUR_IA.md) et [tickets S2](chefferie-de-projet/GITHUB_PROJECTS_SEANCE_2.md) | Identifier son périmètre immédiat et ses critères   |
| Architecture               | [Contrats et autonomie S2](architecture/CONTRATS_SEANCE_2.md)                                              | Commencer sans attendre une autre branche           |
| Ticket                     | [Modèle de ticket](chefferie-de-projet/TEMPLATE_TICKET.md)                                                 | Préparer la séance et ses dépendances sans attendre |
| Rendu                      | [Modèle de rapport](chefferie-de-projet/TEMPLATE_RAPPORT_SEANCE.md)                                        | Expliquer les résultats et transmettre les preuves  |
| Parcours individuel        | [Missions de Yann](chefferie-de-projet/YANN_MISSIONS.md)                                                   | Approfondir le domaine compte utilisateur           |
| Résultats                  | [Rapports S2](seances/seance-2/README.md)                                                                  | Consulter ce qui a réellement été livré             |

## Ordre de lecture

Première arrivée : vision → contribution → roadmap → ticket de la séance → contrat concerné.
À chaque séance suivante : ticket, rapports pertinents de la séance précédente et état du code. Il n’est pas nécessaire de relire toute la documentation pour une modification ciblée.

Les règles générales appartiennent au guide de contribution ; le briefing précise la séance ; le ticket précise le résultat individuel. Un ticket ne peut pas supprimer les contrôles de sécurité ou déclarer réalisé un travail absent. En cas de contradiction, proposer une correction ciblée avant de changer un contrat partagé.

Les fichiers Word/PDF du dossier de chefferie sont des supports historiques non synchronisés automatiquement. Les Markdown ci-dessus sont la référence opérationnelle. Les rapports attestent des résultats observés ; les roadmaps expriment des intentions. L’absence de rapport ne permet pas de déduire qu’une fonction est terminée.

## Statuts communs

| Statut           | Sens                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| À faire          | Périmètre défini, travail non commencé                                           |
| En cours         | Modification active sur une branche                                              |
| En revue         | PR ouverte, preuves disponibles                                                  |
| Validé isolément | Fonction vérifiée avec un contrat et des doublures ; intégration réelle restante |
| Intégré          | Vérifié avec ses dépendances réelles et fusionné                                 |
| Bloqué           | Prérequis externe identifié ; travaux indépendants poursuivis                    |
| Reporté          | Travail replanifié explicitement avec motif                                      |

Ces statuts sont renseignés dans le ticket ou la PR ; pas de second tableau manuel obligatoire dans chaque document. Dans GitHub Projects, les vues par personne, séance, domaine et priorité sont des recommandations à configurer, pas une configuration déjà appliquée par ces fichiers.
