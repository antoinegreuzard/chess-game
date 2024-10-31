
# Guide de Contribution

Merci de l'intérêt que vous portez à ce projet ! Voici quelques lignes directrices pour contribuer efficacement.

## Comment Contribuer

1. **Signalez des problèmes** : Si vous trouvez un bug, créez un ticket en décrivant le problème. Utilisez un titre clair et fournissez un maximum de détails pour permettre à l'équipe de le reproduire et de le corriger.
2. **Suggérez des fonctionnalités** : Pour de nouvelles fonctionnalités, ouvrez un ticket pour discuter de votre idée. Nous serons heureux d'en parler pour voir si elle s'aligne avec la vision du projet.
3. **Proposez des modifications** : Si vous souhaitez corriger un bug ou ajouter une fonctionnalité, suivez les étapes ci-dessous pour ouvrir une pull request.

## Préparer Votre Environnement

1. **Clonez le dépôt** :
   ```bash
   git clone https://github.com/antoinegreuzard/chess-game.git
   cd votre-repo
   ```
2. **Installez les dépendances** :
   - Utilisez la commande suivante pour installer les dépendances :
     ```bash
     npm install
     ```
   - Assurez-vous que votre environnement est à jour avant de commencer.

3. **Respectez les conventions de code** :
   - Assurez-vous que votre code est conforme aux normes de style du projet.
   - Exécutez les tests pour vérifier que tout fonctionne correctement.

## Processus de Pull Request (PR)

1. **Créez une branche** :
   - Donnez un nom significatif à votre branche pour refléter votre travail :
     ```bash
     git checkout -b feature/nom-de-la-fonctionnalite
     ```
   - Utilisez `feature/` pour les nouvelles fonctionnalités et `fix/` pour les corrections de bugs.

2. **Effectuez des commits clairs et descriptifs** :
   - Essayez de garder chaque commit focalisé sur une tâche spécifique. Exemples de messages :
     ```markdown
     feat: ajout de la fonctionnalité X
     fix: correction du bug Y dans Z
     ```

3. **Assurez-vous que les tests passent** :
   - Exécutez les tests avant de soumettre la PR pour vous assurer que tout fonctionne correctement.
   - Ajoutez des tests si nécessaire pour couvrir votre modification.

4. **Ouvrez une Pull Request** :
   - Poussez votre branche vers le dépôt :
     ```bash
     git push origin feature/nom-de-la-fonctionnalite
     ```
   - Ouvrez une PR en suivant le modèle de PR dans `.github/pull_request_template.md`.
   - Assurez-vous de lier votre PR à un problème existant si cela est pertinent.

## Normes de Style

- Utilisez des **indentations de 2 espaces**.
- Respectez les **conventions de nommage** du projet.
- Documentez les parties importantes de votre code si elles ne sont pas évidentes.

## Revue de Code

Chaque PR sera examinée par un ou plusieurs mainteneurs du projet. Assurez-vous de répondre aux commentaires et d'apporter les modifications nécessaires.

## Code de Conduite

Veuillez lire et respecter le [Code de Conduite](CODE_OF_CONDUCT.md) pour maintenir un environnement respectueux et collaboratif.

---

Merci de contribuer ! Vos efforts aident ce projet à s'améliorer !
