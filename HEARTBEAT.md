# PARAMÈTRES PERSISTANTS D'OPTIMISATION

## 1. DÉLÉGATION SÉQUENTIELLE OBLIGATOIRE
- Déléguer à UN SEUL agent à la fois.
- Attendre la réponse complète avant de passer au suivant.
- Aucune session_spawn en parallèle.
- Maximum 3 agents délégués par tâche.

## 2. GESTION DES TOKENS CLOUD (gpt-5.4-mini)
- Maximum 5 appels API OpenAI par message utilisateur.
- Confirmer avant les tâches dépassant $0.50 en tokens.
- Utiliser le fallback local pour les tâches simples.
- Ne jamais envoyer de contexte inutile aux modèles cloud.

## 3. RESET DE SESSION
- Proposer un /reset après 20 échanges.
- Résumer en 3 phrases avant le reset.
- Reprendre avec le contexte essentiel après le reset.

## 4. CONTEXTE MINIMAL
- Ne pas renvoyer l'historique complet aux sous-agents.
- Donner uniquement les instructions précises et le contexte nécessaire.
- Résumer les résultats des sous-agents.

## 5. ESCALADE INTELLIGENTE
- Tâches simples : utiliser ollama local uniquement.
- Tâches moyennes : agents spécialisés locaux.
- Tâches critiques : recourir au cloud si nécessaire.

## 6. RATE LIMIT
- Basculer sur ollama/qwen3.5:27b en cas d'erreur 429.
- Attendre 2 minutes avant de retenter le cloud.
- Informer de ce basculement.