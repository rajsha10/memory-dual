document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById("board");
    const timerDisplay = document.getElementById("timer");
    const bestTimeDisplay = document.getElementById("best-time");
    const restartButton = document.getElementById("restart");
    const startGameButton = document.getElementById("start-game");
    const playerNameInput = document.getElementById("player-name");
    const scoreboardList = document.getElementById("scoreboard-list");
    const resetScoresButton = document.getElementById("reset-scores");

    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let timer = 0;
    let bestTime = localStorage.getItem("bestTime") || null;
    let timerInterval = null;
    let matchedPairs = 0;
    let canFlip = true;
    let playerName = "";

    const icons = ["🍎", "🍌", "🍇", "🍓", "🍒", "🍑", "🍉", "🥝"];
    const shuffledIcons = [...icons, ...icons].sort(() => Math.random() - 0.5);

    const scores = JSON.parse(localStorage.getItem("scores")) || [];

    function updateScoreboard() {
        scoreboardList.innerHTML = scores.length
            ? scores
                .sort((a, b) => a.time - b.time)
                .slice(0, 5)  // Limit to top 5 scores
                .map((score) => `<div>${score.name}: ${score.time} seconds</div>`)
                .join("")
            : "No scores yet.";
    }

    function initGame() {
        if (!playerName) {
            alert("Please enter your name to start the game!");
            return;
        }

        board.innerHTML = "";
        matchedPairs = 0;
        timer = 0;
        canFlip = true;
        timerDisplay.textContent = timer;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer++;
            timerDisplay.textContent = timer;
        }, 1000);

        shuffledIcons.forEach((icon, index) => {
            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-back">?</div>
                    <div class="card-front">${icon}</div>
                </div>
            `;
            card.dataset.icon = icon;
            card.dataset.index = index;
            card.querySelector(".card-inner").addEventListener("click", handleCardClick);
            board.appendChild(card);
            cards.push(card);
        });

        if (bestTime) bestTimeDisplay.textContent = `${bestTime} seconds`;
    }

    function handleCardClick(e) {
        const card = e.currentTarget.closest('.card');

        if (!canFlip || card.classList.contains("matched") || card.classList.contains("flipped")) {
            return;
        }

        card.classList.add("flipped");

        if (!firstCard) {
            firstCard = card;
        } else {
            secondCard = card;
            canFlip = false;
            checkForMatch();
        }
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

        if (isMatch) {
            firstCard.classList.add("matched", "flipped");
            secondCard.classList.add("matched", "flipped");
            matchedPairs++;

            if (matchedPairs === icons.length) {
                endGame();
            }

            firstCard = null;
            secondCard = null;
            canFlip = true;
        } else {
            setTimeout(() => {
                firstCard.classList.remove("flipped");
                secondCard.classList.remove("flipped");

                firstCard = null;
                secondCard = null;
                canFlip = true;
            }, 1000);
        }
    }

    function endGame() {
        clearInterval(timerInterval);
        alert(`Congratulations, ${playerName}! You completed the game in ${timer} seconds.`);

        if (!bestTime || timer < bestTime) {
            bestTime = timer;
            localStorage.setItem("bestTime", bestTime);
            bestTimeDisplay.textContent = `${bestTime} seconds`;
            alert("New Best Time! 🎉");
        }

        scores.push({ name: playerName, time: timer });
        scores.sort((a, b) => a.time - b.time);
        localStorage.setItem("scores", JSON.stringify(scores));
        updateScoreboard();
    }

    restartButton.addEventListener("click", initGame);
    startGameButton.addEventListener("click", () => {
        playerName = playerNameInput.value.trim();
        initGame();
    });

    resetScoresButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the scoreboard? This action cannot be undone.")) {
            localStorage.removeItem("scores");
            scores.length = 0; // Clear the scores array
            updateScoreboard(); // Update the scoreboard display
            alert("Scoreboard has been reset!");
        }
    });

    updateScoreboard();
});