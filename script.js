// La configuration de Firebase (assure-toi que ces valeurs sont exactes)
const firebaseConfig = {
  apiKey: "AIzaSyDoEbsTM4b3ZoBrJliTout9yIcl8bs62so",
  authDomain: "vieilles-brouette.firebaseapp.com",
  databaseURL: "https://vieilles-brouette-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vieilles-brouette",
  storageBucket: "vieilles-brouette.firebasestorage.app",
  messagingSenderId: "194696608467",
  appId: "1:194696608467:web:d95710877f0e3d2849f226",
  measurementId: "G-9X5C4W7SKH"
};

// Initialise Firebase - C'est la bonne façon avec le SDK "compat"
firebase.initializeApp(firebaseConfig); 
// Note : Tu n'as plus besoin de 'const analytics = getAnalytics(app);' car tu n'as pas importé getAnalytics
// ni de 'const app = initializeApp(firebaseConfig);'
// La variable 'firebase' est déjà globale grâce aux scripts compat.js dans ton HTML.

// Récupère une référence à la base de données
const database = firebase.database();

// Récupère le nom de l'ami depuis l'URL de la page (ex: "thomas", "hubert", "aigris")
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const friendNameWithExtension = pathParts[pathParts.length - 1];
const friendName = friendNameWithExtension.split('.')[0]; // Ceci donnera 'thomas', 'hubert', 'aigris' etc.

// Limites d'interactions
const MAX_INTERACTIONS_PER_FRIEND = 5; // Limite pour les emojis "normaux"
const MAX_RAGE_BAIT_CLICKS = 100; // Nouvelle limite pour le bouton "ragebait"
const LOCAL_STORAGE_KEY_PREFIX = 'interactions_'; // Préfixe pour les clés dans localStorage

// Fonction pour récupérer le nombre d'interactions locales pour un ami donné
function getLocalInteractionsCount(friend) {
    const key = LOCAL_STORAGE_KEY_PREFIX + friend;
    const count = localStorage.getItem(key);
    return parseInt(count) || 0; // Retourne le nombre ou 0 si non trouvé
}

// Fonction pour enregistrer le nombre d'interactions locales pour un ami donné
function setLocalInteractionsCount(friend, count) {
    const key = LOCAL_STORAGE_KEY_PREFIX + friend;
    localStorage.setItem(key, count);
}

// Fonction pour charger et afficher les compteurs d'emojis depuis Firebase
function loadEmojiCounts() {
    const friendRef = database.ref('reactions/' + friendName);

    // Écoute les changements de valeur en temps réel
    friendRef.on('value', (snapshot) => {
        const data = snapshot.val() || {}; // Récupère les données, ou un objet vide si pas de données

        // Sélectionne tous les éléments <span class="reaction-count"> sur la page
        const reactionCountSpans = document.querySelectorAll('.reaction-count');

        // Pour chaque span, met à jour son contenu avec la valeur correspondante de Firebase
        reactionCountSpans.forEach(span => {
            // Extrait l'ID de l'emoji depuis l'attribut 'id' du span (ex: 'count-laugh' -> 'laugh')
            const emojiId = span.id.replace('count-', '');
            
            // Met à jour le texte du span avec la valeur de la BDD, ou 0 si non défini
            span.textContent = data[emojiId] || 0;
        });
    });
}

// Fonction pour incrémenter le compteur d'un emoji spécifique
function incrementEmojiCount(emojiId) {
    let currentLocalCount = getLocalInteractionsCount(friendName);

    // Détermine la limite d'interactions en fonction de l'emojiId
    let currentMaxLimit = MAX_INTERACTIONS_PER_FRIEND;
    if (emojiId === 'ragebait') {
        currentMaxLimit = MAX_RAGE_BAIT_CLICKS;
    }

    // Vérifie si la limite locale a été atteinte
    if (currentLocalCount >= currentMaxLimit) {
        alert(`Tu as déjà réagi ${currentMaxLimit} fois pour ${friendName} ! Reviens plus tard.`);
        return; // Arrête la fonction si la limite est atteinte
    }

    // Référence à l'emoji spécifique dans la base de données
    const emojiRef = database.ref('reactions/' + friendName + '/' + emojiId);

    // Utilise une transaction pour incrémenter le compteur de manière sécurisée
    emojiRef.transaction((currentCount) => {
        return (currentCount || 0) + 1; // Incrémente le compteur ou commence à 1 si inexistant
    }, (error, committed, snapshot) => {
        if (error) {
            console.error("La transaction Firebase a échoué :", error);
        } else if (committed) {
            // Si la transaction Firebase a réussi, met à jour le compteur local
            setLocalInteractionsCount(friendName, currentLocalCount + 1);
            console.log(`Interaction locale enregistrée pour ${friendName}. Total: ${currentLocalCount + 1}`);
        }
    });
}

// Code exécuté une fois que le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    // ... (ton code existant pour loadEmojiCounts)

    // Attache les écouteurs d'événements aux boutons d'emojis
    const emojiButtons = document.querySelectorAll('.emoji-button');
    
    // NOUVELLES VARIABLES ET LOGIQUE POUR LE SON
    let hasPlayedAudio = false; // Pour s'assurer que l'audio ne démarre qu'une fois
    const aigrisAudio = document.getElementById('aigris-audio'); // Récupère l'élément audio

    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emojiId = button.getAttribute('data-emoji-id');
            if (emojiId) {
                // Incrémente le compteur comme d'habitude
                incrementEmojiCount(emojiId);

                // LOGIQUE SPÉCIFIQUE AU BOUTON RAGEBAIT POUR LE SON
                if (emojiId === 'ragebait' && friendName === 'aigris' && aigrisAudio && !hasPlayedAudio) {
                    aigrisAudio.play().then(() => {
                        console.log("Musique lancée avec succès !");
                        hasPlayedAudio = true; // Marque comme joué
                    }).catch(error => {
                        console.error("Erreur lors de la tentative de lecture de la musique :", error);
                        // Ceci peut arriver si le navigateur bloque toujours, ou si l'utilisateur
                        // n'a pas interagi assez pour lever la restriction.
                    });
                }
            }
        });
    });

    // Optionnel : Gérer le bouton Instagram si nécessaire (le lien href le fait déjà)
    const instagramButton = document.querySelector('.instagram-button');
    if (instagramButton) {
        instagramButton.addEventListener('click', (event) => {
            // Si tu veux empêcher le comportement par défaut du lien ou ajouter une autre logique
            // event.preventDefault();
            // console.log("Bouton Instagram cliqué !");
            // window.open(instagramButton.href, '_blank');
        });
    }
});
