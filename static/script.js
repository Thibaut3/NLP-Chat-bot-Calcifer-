window.addEventListener('DOMContentLoaded', async () => {
    // Chargement de l'historique
    try {
      const response = await fetch('/get_history');
      const history = await response.json();
      const responseDiv = document.getElementById('api-response');
      if (history.length > 0) {
        const lastMessage = history[history.length - 1];
        const lastUserMessage = lastMessage.user.toLowerCase();
        
        // Vérifie si "au revoir" est absent dans le dernier message utilisateur
        if (!lastUserMessage.includes('au revoir')) {
          responseDiv.textContent = "Hmm... Tu m'as quitté sans dire au revoir la dernière fois ! Tu veux m'éteindre ? 🔥";
          responseDiv.style.color = 'black';
        } else {
          responseDiv.textContent = ''; 
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    }
  
    // Initialisation du système d'animation de Calcifer
    initCalciferAnimations();
  });
  
  // Variable pour suivre si c'est la première requête
  let isInitial = true;
  
  // Configuration des animations de Calcifer
  function initCalciferAnimations() {
    const calcifer = document.getElementById('calcifer');
    const pupil = document.querySelector('.pupil');
    let pupilAnimation = null;
    
    // Fonction qui crée et lance l'animation de la pupille
    function startPupilAnimation() {
      // Si Calcifer est en mode "think" ou "active", ne pas lancer l'animation
      if (calcifer.classList.contains('think') || calcifer.classList.contains('active') || calcifer.classList.contains('closing')) {
        schedulePupilAnimation();
        return;
      }
  
      // Choix de la translation aléatoire (valeurs en pixels)
      const choices = [-5, 0, 5];
      let tx = choices[Math.floor(Math.random() * choices.length)];
      let ty = choices[Math.floor(Math.random() * choices.length)];
  
      // Si tx et ty sont tous les deux 0, on force l'un des deux à être 5
      if (tx === 0 && ty === 0) {
        if (Math.random() < 0.5) {
          tx = 5;
        } else {
          ty = 5;
        }
      }
            
      // Durée de la phase de maintien actif (entre 2000 et 4000ms)
      const holdTime = Math.random() * 2000 + 2000;
      const transitionTime = 200; // Temps pour la transition d'entrée et de sortie
      const totalDuration = holdTime + 2 * transitionTime;
  
      pupilAnimation = pupil.animate([
        { transform: 'translate(0, 0)', offset: 0 },
        // Passage vers l'état actif en transitionTime
        { transform: `translate(${tx}px, ${ty}px)`, offset: transitionTime / totalDuration },
        // Maintien de l'état actif durant holdTime
        { transform: `translate(${tx}px, ${ty}px)`, offset: (transitionTime + holdTime) / totalDuration },
        // Retour à la position initiale en transitionTime
        { transform: 'translate(0, 0)', offset: 1 }
      ], {
        duration: 6000,
        easing: 'ease-in-out'
      });
  
      pupilAnimation.onfinish = () => {
        pupilAnimation = null;
        schedulePupilAnimation();
      };
  
      pupilAnimation.oncancel = () => {
        pupilAnimation = null;
        schedulePupilAnimation();
      };
    }
  
    // Planifie le déclenchement automatique de l'animation de la pupille
    function schedulePupilAnimation() {
      const delay = Math.random() * (30000 - 15000) + 15000; // délai entre 15 et 30 secondes
      setTimeout(startPupilAnimation, delay);
    }
  
    // Démarrage de la planification initiale
    schedulePupilAnimation();
  
    // Fonction pour arrêter l'animation de la pupille en cours si elle existe
    function stopPupilAnimation() {
      if (pupilAnimation) {
        pupilAnimation.cancel();
        pupilAnimation = null;
      }
    }
  
    // Gestion du clic sur Calcifer
    calcifer.addEventListener('click', () => {
      // En cas d'animation de la pupille en cours, on l'annule
      if (calcifer.classList.contains('think') || calcifer.classList.contains('active') || calcifer.classList.contains('closing')) {
        console.log("Animation en cours...")
      }else{
        stopPupilAnimation();
    
        // Bascule de l'animation active sur Calcifer
        calcifer.classList.add('tousse');
        calcifer.classList.add('fumee');
    
        // Si on désactive, on réinitialise la classe après 600ms (pour laisser le temps à la transition de se faire)
        setTimeout(() => {
          calcifer.classList.remove('tousse');
        }, 250);

        setTimeout(() => {
          calcifer.classList.remove('fumee');
        }, 1700);
      }
    });
  
    // Traitement du clic sur le bouton
    document.getElementById('process-button').addEventListener('click', async () => {
      const text = document.getElementById('user-text').value;
      const responseDiv = document.getElementById('api-response');
      
      // Configuration du bouton
      const button = document.getElementById('process-button');
      const buttonText = document.querySelector('.button-text');
      
      button.disabled = true;
      buttonText.textContent = 'Traitement en cours...';
  
      // Arrêter l'animation de la pupille
      stopPupilAnimation();
      
      // Activer l'animation "think" pendant le traitement
      calcifer.classList.add('think');
  
      try {
        const response = await fetch('/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: text,
            isInitial: isInitial
          })
        });
  
        const data = await response.json();
        
        // Désactiver l'animation "think"
        calcifer.classList.remove('think');
        
        if (data.error) {
          responseDiv.textContent = `Erreur: ${data.error}`;
          responseDiv.style.color = 'red';
        } else {
          // Déclencher l'animation "active" de Calcifer
          calcifer.classList.add('active');
          
          // Réinitialiser après l'animation "active"
          setTimeout(() => {
            calcifer.classList.add('closing');
            calcifer.classList.remove('active');
            setTimeout(() => calcifer.classList.remove('closing'), 600);
          }, 3000);
  
          responseDiv.innerHTML = data.response;
          responseDiv.style.color = 'black';
        }
      } catch (error) {
        console.error('Erreur:', error);
        responseDiv.textContent = 'Une erreur est survenue';
        responseDiv.style.color = 'red';
        
        // Désactiver l'animation "think" en cas d'erreur
        calcifer.classList.remove('think');
      } finally {
        button.disabled = false;
        buttonText.textContent = 'Valider';
        isInitial = false; // Après la première requête
      }
    });
  }