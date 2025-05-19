# NLP-Chat-bot-Calcifer

Ce projet est une application web Flask qui met en œuvre un chatbot basé sur le modèle de langage Llama.cpp. Le chatbot est conçu pour imiter le personnage de Calcifer du film "Le Château Ambulant".

## Fonctionnalités

* **Chatbot Calcifer :** Le chatbot est une représentation du personnage de Calcifer, offrant une expérience de conversation unique.
* **Interface Web Flask :** L'application est construite avec Flask, fournissant une interface web simple pour interagir avec le chatbot.
* **Historique des conversations :** Le chatbot maintient un historique des conversations, permettant des interactions contextuelles.
* **Modèle Llama.cpp :** L'application utilise un modèle Llama.cpp pour générer des réponses.
* **Modèle GGUF :** Le modèle Llama.cpp doit être fourni par l'utilisateur au format GGUF et placé dans le répertoire `static/`.
* **Configuration du modèle :** Le modèle par défaut est "Phi-4-mini-instruct-Q3\_K\_M.gguf".

## Prérequis

* Python 3.x
* Les bibliothèques listées dans `requirements.txt`
* Un modèle Llama.cpp au format GGUF (par exemple, "Phi-4-mini-instruct-Q3\_K\_M.gguf")

## Installation

1.  Clonez ce dépôt :

    ```bash
    https://github.com/Thibaut3/NLP-Chat-bot-Calcifer-.git
    cd votre-repo-nom
    ```

2.  Créez un environnement virtuel (recommandé) :

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # Sur Linux/macOS
    venv\Scripts\activate  # Sur Windows
    ```

3.  Installez les dépendances :

    ```bash
    pip install -r requirements.txt
    ```

4.  Téléchargez le modèle Llama.cpp au format GGUF (par exemple, "Phi-4-mini-instruct-Q3\_K\_M.gguf") et placez-le dans le répertoire `static/`.

## Utilisation

1.  Exécutez l'application Flask :

    ```bash
    python app.py
    ```

2.  Ouvrez votre navigateur web et accédez à l'URL affichée (généralement `http://127.0.0.1:5000/`).

3.  Commencez à discuter avec Calcifer !

## Configuration

* **Modèle Llama.cpp :** L'application est configurée pour utiliser le modèle "Phi-4-mini-instruct-Q3\_K\_M.gguf" par défaut. Vous pouvez remplacer ce modèle par un autre modèle Llama.cpp au format GGUF en le plaçant dans le répertoire `static/` et en modifiant le code si nécessaire.
* **Personnalité de Calcifer :** Le comportement du chatbot est défini dans le code. Vous pouvez modifier le prompt ou les paramètres du modèle pour ajuster la personnalité de Calcifer.

## Dépendances

* Flask
* llama-cpp-python
* Autres (spécifiées dans `requirements.txt`)

## Notes

* Assurez-vous que le modèle Llama.cpp est compatible avec la version de `llama-cpp-python` que vous utilisez.
* Les performances du chatbot dépendent des capacités de votre système et de la taille du modèle Llama.cpp.

Nom : \`Votre Nom\`

## Licence

Ce projet est sous licence \`[Nom de la licence, par exemple, MIT]\`.
