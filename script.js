// Votre configuration Firebase (celle que tu m'as donnée)
const firebaseConfig = {
    apiKey: "AIzaSyDoEbsTM4b3ZoBrJliTout9yIcl8bs62so",
    authDomain: "vieilles-brouette.firebaseapp.com",
    databaseURL: "https://vieilles-brouette-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "vieilles-brouette",
    storageBucket: "vieilles-brouette.firebasestorage.app",
    messagingSenderId: "194696608467",
    appId: "1:194696608467:web:d95710877f0e3d2849f226",
    measurementId: "G-9X5C4W7SKH" // Tu peux le retirer si tu n'utilises pas Analytics
};

// Initialise Firebase (utilise la variable globale `firebase` fournie par le CDN)
firebase.initializeApp(firebaseConfig);

// ... (ton code Firebase existant)

const database = firebase.database();

const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
const friendNameWithExtension = pathParts[pathParts.length - 1];
const friendName = friendNameWithExtension.split('.')[0];

// --- NOUVEAU : Variables pour la limite d'interactions ---
const MAX_INTERACTIONS_PER_FRIEND = 5; // Définis ta limite ici
const MAX_RAGE_BAIT_CLICKS = 100; // Nouvelle limite pour le bouton "rage bait"
const LOCAL_STORAGE_KEY_PREFIX = 'interactions_'; // Préfixe pour la clé localStorage

// Fonction pour obtenir le nombre d'interactions locales pour cet ami
function getLocalInteractionsCount(friend) {
    const key = LOCAL_STORAGE_KEY_PREFIX + friend;
    const count = localStorage.getItem(key);
    return parseInt(count) || 0; // Retourne 0 si pas encore de compteur
}

// Fonction pour mettre à jour le nombre d'interactions locales pour cet ami
function setLocalInteractionsCount(friend, count) {
    const key = LOCAL_STORAGE_KEY_PREFIX + friend;
    localStorage.setItem(key, count);
}

// Fonction pour charger et afficher les compteurs d'emojis
function loadEmojiCounts() {
    const friendRef = database.ref('reactions/' + friendName);

    friendRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('count-laugh').textContent = data.laugh || 0;
            document.getElementById('count-heart').textContent = data.heart || 0;
            // Assure-toi que tous tes emojis sont ici
            document.getElementById('count-party').textContent = data.party || 0;
            document.getElementById('count-rock').textContent = data.rock || 0;
            document.getElementById('count-star').textContent = data.star || 0;
        } else {
            document.getElementById('count-laugh').textContent = 0;
            document.getElementById('count-heart').textContent = 0;
            document.getElementById('count-party').textContent = 0;
            document.getElementById('count-rock').textContent = 0;
            document.getElementById('count-star').textContent = 0;
        }
    });
}

function incrementEmojiCount(emojiId) {
    let currentLocalCount = getLocalInteractionsCount(friendName);

    // Détermine la limite à appliquer
    let currentMaxLimit = MAX_INTERACTIONS_PER_FRIEND;
    if (emojiId === 'ragebait') { // Si c'est le bouton "ragebait"
        currentMaxLimit = MAX_RAGE_BAIT_CLICKS;
    }

    if (currentLocalCount >= currentMaxLimit) {
        alert(`Tu as déjà réagi ${currentMaxLimit} fois pour ${friendName} ! Reviens plus tard.`);
        return; // Arrête la fonction si la limite est atteinte
    }

    const emojiRef = database.ref('reactions/' + friendName + '/' + emojiId);
    emojiRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    }, (error, committed, snapshot) => {
        if (error) {
            console.error("Transaction failed abnormally!", error);
        } else if (committed) {
            // Si la transaction Firebase a réussi, met à jour le compteur local
            setLocalInteractionsCount(friendName, currentLocalCount + 1);
            console.log(`Interaction locale enregistrée pour ${friendName}. Total: ${currentLocalCount + 1}`);
        }
    });
}

// Attache les gestionnaires d'événements aux boutons d'emojis
document.addEventListener('DOMContentLoaded', () => {
    loadEmojiCounts();

    const emojiButtons = document.querySelectorAll('.emoji-button');
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emojiId = button.getAttribute('data-emoji-id');
            if (emojiId) {
                incrementEmojiCount(emojiId);
            }
        });
    });

    // Gère le lien Instagram
    const instagramButton = document.querySelector('.instagram-button');
    if (instagramButton) {
        instagramButton.addEventListener('click', () => {
            // Rien à faire ici si le lien est déjà un <a> href avec target="_blank"
        });
    }
});
