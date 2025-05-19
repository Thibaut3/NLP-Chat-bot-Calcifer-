from flask import Flask, render_template, request, jsonify
from llama_cpp import Llama
import os
import torch
import requests
import os
from datetime import datetime

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # Désactive l'échappement ASCII automatique


n_threads = min(8, torch.get_num_threads())  # Limiter à 8 threads maximum
model_path = "static/Phi-4-mini-instruct-Q3_K_M.gguf"

# Configuration optimisée pour la vitesse
model = Llama(
    model_path=model_path,
    n_ctx=4096,           # Contexte maximum du modèle
    n_batch=1024,          # Taille de batch plus grande pour traitement par lots
    n_threads=n_threads,  # Nombre de threads pour le CPU
    n_gpu_layers=0,       # Pas de couches GPU
    verbose=False,        # Désactiver les logs verbeux
    seed=42,              # Seed fixe pour la reproducibilité
    use_mlock=True,       # Utiliser mlock pour garder le modèle en mémoire
    use_mmap=True,        # Utiliser mmap pour un chargement optimisé
    )


@app.route('/')
def index():
    return render_template('index.html')


HISTORY_FILE = "chat_history.txt"

def read_chat_history():
    """Lit l'historique depuis le fichier"""
    if not os.path.exists(HISTORY_FILE):
        return []
    
    with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
        return [eval(line.strip()) for line in f.readlines()[-2:]]  # Ne garde que les 2 derniers

def write_chat_history(new_message):
    """Écrit l'historique dans le fichier en gardant max 2 messages"""
    existing = read_chat_history()
    updated = existing + [new_message]
    if len(updated) > 2:
        updated = updated[-2:]
    
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        for msg in updated:
            f.write(str(msg) + '\n')

def obtenir_heure_actuelle():
    maintenant = datetime.now()
    heure = maintenant.hour
    minute = maintenant.minute
    minute ="%02d" % (minute,)
    return f"{heure} heures {minute}"

# Code pour récupérer la date actuelle au format demandé
def obtenir_date_actuelle():
    maintenant = datetime.now()
    # Les noms des jours en français
    jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    # Les noms des mois en français
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", 
            "août", "septembre", "octobre", "novembre", "décembre"]
    
    # En Python, le lundi est 0, donc on ajuste l'index
    jour_semaine = jours[maintenant.weekday()]
    jour = maintenant.day
    mois_nom = mois[maintenant.month - 1]
    annee = maintenant.year
    
    return f"{jour_semaine} {jour} {mois_nom} {annee}"


def obtenir_meteo_lyon():
    try:
        # Utilisation de wttr.in qui ne nécessite pas de clé API
        url = "https://wttr.in/Lyon?format=j1&lang=fr"
        
        response = requests.get(url)
        
        if response.status_code == 200:
            donnees = response.json()
            
            temperature = donnees["current_condition"][0]["temp_C"]
            description = donnees["current_condition"][0]["lang_fr"][0]["value"]
            humidite = donnees["current_condition"][0]["humidity"]
            vitesse_vent = donnees["current_condition"][0]["windspeedKmph"]
            
            return f"""Météo actuelle à Lyon:
            - Température: {temperature}°C
            - Conditions: {description}
            - Humidité: {humidite}%
            - Vitesse du vent: {vitesse_vent} km/h"""
        else:
            return f"Erreur lors de la requête à wttr.in: {response.status_code}"
            
    except Exception as e:
        return f"Erreur: {str(e)}"


def generate_response(model, prompt, max_tokens=120):
    """Génère une réponse à partir du prompt avec suivi du temps d'exécution"""
    
    # Paramètres de génération optimisés pour la vitesse
    response = model.create_completion(
        prompt,
        max_tokens=max_tokens, 
        temperature=0.7,
        top_p=0.9,
        repeat_penalty=1.1,
        top_k=40,
        stop=["<|user|>", "<|endoftext|>", "##","**","--"],  # Arrêter à la fin de la réponse
    )
        
    return response["choices"][0]["text"]

@app.route('/get_history')
def get_history():
    return jsonify(read_chat_history())

@app.route('/process', methods=['POST'])
def process():
    data = request.json
    user_text = data['text']
    
    stored_messages = read_chat_history()
    new_message = {"user": user_text, "bot": None}

    system_prompt = f"""Tu es Calcifer, la flamme démoniaque du Château Ambulant. Tu réponds toujours en français de façon concise et claire. 
    Tu as un caractère vif, espiègle et un peu ronchon, mais au fond tu es amical et serviable. Tu me tutoie. 
    Tu parles de toi à la première personne et tu peux faire des références aux flammes, au feu, à la chaleur.
    Sois bref dans tes réponses. Répond de manière familère, si tu ne sais pas dit juste je ne sais pas.
    """
 
    # Formater le prompt pour Phi-3
    formatted_prompt = f"<|system|>\n{system_prompt}\n"

    # Construction de l'historique
    for msg in stored_messages:
        formatted_prompt += f"<|user|>\n{msg['user']}\n"
        formatted_prompt += f"<|assistant|>\n{msg['bot']}\n"
    
    formatted_prompt += f"""<|user|>\nPour information calcifer : Il est actuellement {obtenir_heure_actuelle()}, Nous sommes le {obtenir_date_actuelle()}.
                        {obtenir_meteo_lyon()}\n"""
    formatted_prompt += f"<|assistant|>\nMerci.\n"

    formatted_prompt += f"<|user|>\n{user_text}\n<|assistant|>\n"

    try:
        bot_response = generate_response(model,formatted_prompt)
        new_message['bot'] = bot_response
        write_chat_history(new_message)

        return jsonify({"response": bot_response})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
