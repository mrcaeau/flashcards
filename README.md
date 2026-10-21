# ⚡ Flashcards Studio

Application web moderne, fluide et esthétique conçue pour réviser et mémoriser efficacement grâce à des flashcards interactives.

Hébergeable gratuitement en 1 clic sur **GitHub Pages**, sans build complexe ni serveur backend : tout fonctionne directement dans le navigateur via de simples dictionnaires JSON.

---

## 🚀 Mise en ligne sur GitHub Pages (Gratuit et Rapide)

1. **Créez un nouveau dépôt sur GitHub** (ex: `flashcards-app`).
2. **Poussez ce dossier sur votre dépôt** :
   ```bash
   git add .
   git commit -m "Initial commit - Flashcards Studio"
   git remote add origin https://github.com/<votre-pseudo>/<votre-depot>.git
   git push -u origin main
   ```
3. **Activez GitHub Pages** :
   - Rendez-vous sur votre dépôt GitHub.
   - Cliquez sur **Settings** (Paramètres) > **Pages** (dans le menu de gauche).
   - Sous **Build and deployment > Source**, choisissez **Deploy from a branch**.
   - Sélectionnez la branche **main** et le dossier **/(root)**, puis cliquez sur **Save**.
4. **Fini !** Votre site sera accessible à l'adresse :
   `https://<votre-pseudo>.github.io/<votre-depot>/`

---

## 🗂️ Comment ajouter un nouveau catalogue de Flashcards

Pour ajouter un nouveau jeu de cartes, il suffit d'effectuer **2 petites étapes** dans Git :

### Étape 1 : Créer le fichier JSON du deck
Créez un nouveau fichier dans le dossier `data/decks/`, par exemple `mon-sujet.json` :

```json
{
  "id": "mon-sujet",
  "title": "Mon Nouveau Sujet",
  "description": "Courte description de ce que couvrent ces cartes.",
  "category": "Sciences",
  "icon": "🔬",
  "language": "fr-FR",
  "cards": [
    {
      "id": 1,
      "question": "Quelle est la question ou la notion à deviner ?",
      "answer": "La réponse détaillée et explicative.",
      "hint": "Un indice facultatif (peut être omis)",
      "tag": "Chapitre 1"
    },
    {
      "id": 2,
      "question": "Deuxième question...",
      "answer": "Deuxième réponse...",
      "hint": "Autre indice",
      "tag": "Chapitre 2"
    }
  ]
}
```

> **Astuce langue audio** : Pour un catalogue de langues étrangères (ex. espagnol `es-ES`, anglais `en-US`, allemand `de-DE`), la propriété `"language"` permet à la synthèse vocale d'utiliser automatiquement le bon accent !

### Étape 2 : L'enregistrer dans `data/catalogs.json`
Ouvrez le fichier `data/catalogs.json` et ajoutez simplement votre catalogue dans la liste :

```json
{
  "id": "mon-sujet",
  "title": "Mon Nouveau Sujet",
  "description": "Courte description de ce que couvrent ces cartes.",
  "category": "Sciences",
  "icon": "🔬",
  "file": "data/decks/mon-sujet.json",
  "tags": ["Sciences", "Biologie"],
  "difficulty": "Intermédiaire"
}
```

Puis poussez vos modifications :
```bash
git add .
git commit -m "Ajout du catalogue : Mon Nouveau Sujet"
git push origin main
```
Le site en ligne se met à jour automatiquement !

---

## ✨ Fonctionnalités incluses

- 🎴 **Retournement 3D réaliste** des cartes avec animations soignées.
- 🔀 **Mélange aléatoire** des cartes (Shuffle).
- 🔄 **Mode inversé** : Révisez dans les deux sens (Question ↔ Réponse).
- 🔊 **Synthèse vocale intégrée** (Web Speech API) avec détection de la langue du deck.
- 💡 **Indices rétractables** pour stimuler la mémorisation progressive.
- 📊 **Système d'évaluation** : Marquer « Maîtrisé » ou « À revoir ».
- 🔁 **Mode révision ciblée** : En fin de session, possibilité de réviser uniquement les cartes non maîtrisées.
- 🔍 **Recherche et filtres instantanés** par catégorie et par tags.
- 📂 **Importateur / Testeur en direct** : Glissez-déposez n'importe quel fichier JSON pour tester un deck sans attendre de le commiter.
- 🌙 **Thème sombre & clair** avec bascule instantanée et mémorisation locale.
- ⌨️ **Raccourcis clavier complets** :
  - `Espace` ou `Entrée` : Retourner la carte
  - `→` / `←` : Carte suivante / précédente
  - `1` : Marquer à revoir
  - `2` : Marquer maîtrisé
  - `H` : Afficher l'indice
  - `V` : Écouter la carte
  - `Échap` : Revenir aux catalogues

---

## 💻 Tester localement

Vous pouvez tester l'application directement sur votre machine :

### Option 1 : Avec Python (recommandé pour simuler GitHub Pages)
Dans le terminal :
```bash
python3 -m http.server 8000
```
Puis ouvrez [http://localhost:8000](http://localhost:8000) dans votre navigateur.

### Option 2 : Avec l'extension VS Code Live Server
Faites un clic droit sur `index.html` > *Open with Live Server*.
