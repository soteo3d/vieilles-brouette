document.addEventListener('DOMContentLoaded', () => {
    const phrases = [
        "Que ta journée soit remplie de sourires !",
        "Tu es une étoile brillante, n'oublie jamais ça.",
        "Différent est beau. Sois toi-même, le monde s'adaptera.",
        "Un petit geste de gentillesse peut changer la journée de quelqu'un.",
        "Crois en toi et tout devient possible.",
        "Le bonheur est souvent dans les choses les plus simples.",
        "Partage ta joie, elle est contagieuse !",
        "Chaque jour est une nouvelle chance d'être heureux.",
        "Ta présence illumine le monde autour de toi.",
        "N'aie pas peur de briller de mille feux !"
    ];

    const phraseDisplay = document.getElementById('random-phrase');
    const generateButton = document.getElementById('generate-phrase-button');

    // Fonction pour générer une phrase aléatoire
    function generateRandomPhrase() {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        const selectedPhrase = phrases[randomIndex];

        // Ajoute et retire une classe pour une animation de fade-in/out
        phraseDisplay.classList.remove('fade-in');
        phraseDisplay.classList.add('fade-out');

        // Attend la fin de l'animation de fade-out avant de changer le texte
        setTimeout(() => {
            phraseDisplay.textContent = selectedPhrase;
            phraseDisplay.classList.remove('fade-out');
            phraseDisplay.classList.add('fade-in');
        }, 300); // Durée de l'animation en ms
    }

    // Attache l'événement au bouton
    generateButton.addEventListener('click', generateRandomPhrase);

    // Génère une phrase au chargement initial de la page
    generateRandomPhrase();
});
