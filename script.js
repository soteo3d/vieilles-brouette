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

// Obtiens une référence à la base de données Realtime Database
const database = firebase.database();

// --- C'est ici que tu vas ajouter le code pour gérer les compteurs d'emojis ---

// Récupère l'ID de l'ami depuis l'URL de la page (ex: "thomas")
// Cela te permettra d'avoir un seul fichier script.js pour toutes les pages d'amis
const currentPath = window.location.pathname;
const pathParts = currentPath.split('/');
// Assumes URL like /ami.html or /thomas.html
const friendNameWithExtension = pathParts[pathParts.length - 1]; // "thomas.html"
const friendName = friendNameWithExtension.split('.')[0]; // "thomas"


// Fonction pour charger et afficher les compteurs d'emojis
function loadEmojiCounts() {
    // La référence au chemin dans ta BDD pour cet ami
    const friendRef = database.ref('reactions/' + friendName);

    // Écoute les changements en temps réel
    friendRef.on('value', (snapshot) => {
        const data = snapshot.val(); // Récupère toutes les données pour cet ami
        if (data) {
            // Mets à jour l'affichage pour chaque emoji
            document.getElementById('count-laugh').textContent = data.laugh || 0;
            document.getElementById('count-heart').textContent = data.heart || 0;
            document.getElementById('count-party').textContent = data.party || 0;
            document.getElementById('count-rock').textContent = data.rock || 0;
            document.getElementById('count-star').textContent = data.star || 0;
        } else {
            // Si aucune donnée n'existe encore, affiche 0
            document.getElementById('count-laugh').textContent = 0;
            document.getElementById('count-heart').textContent = 0;
            document.getElementById('count-party').textContent = 0;
            document.getElementById('count-rock').textContent = 0;
            document.getElementById('count-star').textContent = 0;
        }
    });
}

// Fonction pour incrémenter un compteur d'emoji
function incrementEmojiCount(emojiId) {
    const emojiRef = database.ref('reactions/' + friendName + '/' + emojiId);
    emojiRef.transaction((currentCount) => {
        // Incrémente le compteur de 1, ou commence à 1 si c'est la première réaction
        return (currentCount || 0) + 1;
    });
}

// Attache les gestionnaires d'événements aux boutons d'emojis
document.addEventListener('DOMContentLoaded', () => {
    // Charge les compteurs quand la page est prête
    loadEmojiCounts();

    // Récupère tous les boutons d'emojis
    const emojiButtons = document.querySelectorAll('.emoji-button');
    emojiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const emojiId = button.getAttribute('data-emoji-id');
            if (emojiId) {
                incrementEmojiCount(emojiId);
            }
        });
    });

    // Gère le lien Instagram (s'il y en a un)
    const instagramButton = document.querySelector('.instagram-button');
    if (instagramButton) {
        instagramButton.addEventListener('click', () => {
            // Rien à faire ici si le lien est déjà un <a> href avec target="_blank"
            // Sinon, tu pourrais rediriger manuellement : window.open(instagramButton.href, '_blank');
        });
    }
});
