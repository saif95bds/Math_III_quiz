// mascot.js - Handles the mascot animations and interactions
const MASCOT_MESSAGES = {
  idle: [
    "Hi there! Let's solve some math problems!",
    "Ready to learn?",
    "I'm Matty the Math Mascot!",
    "Let's have fun with numbers!"
  ],
  correct: [
    "Great job! You got it right!",
    "Awesome work!",
    "You're so smart!",
    "That's correct! You're amazing!",
    "Wow! Perfect answer!"
  ],
  wrong: [
    "Don't worry, let's try again!",
    "Almost there! Keep trying!",
    "Practice makes perfect!",
    "You'll get it next time!",
    "Learning happens step by step!"
  ],
  excited: [
    "You're on a roll!",
    "You're doing fantastic!",
    "Amazing progress!",
    "You're a math superstar!",
    "Incredible work today!"
  ]
};

// Variables to track streak
let correctStreak = 0;
let wrongCount = 0;
const EXCITED_THRESHOLD = 3; // Show excited animation after 3 correct answers in a row
const MAX_JUMP_LEVEL = 5; // Maximum jump level/height
const ANIMATION_VARIATION = 3; // Number of variations for each animation type

// Initialize the mascot
function initMascot() {
  const container = document.querySelector('.container');
  
  // Create mascot container
  const mascotContainer = document.createElement('div');
  mascotContainer.className = 'mascot-container';
  
  // Create mascot element
  const mascot = document.createElement('div');
  mascot.className = 'mascot idle';
  mascotContainer.appendChild(mascot);
  
  // Create speech bubble
  const speechBubble = document.createElement('div');
  speechBubble.className = 'speech-bubble';
  mascotContainer.appendChild(speechBubble);
  
  // Add mascot to page
  document.body.appendChild(mascotContainer);
  
  // Show initial greeting
  showMascotMessage('idle');
  
  return {
    element: mascot,
    speechBubble: speechBubble,
    container: mascotContainer
  };
}

// Random message from category
function getRandomMessage(category) {
  const messages = MASCOT_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Show mascot message
function showMascotMessage(category) {
  const speechBubble = document.querySelector('.speech-bubble');
  const message = getRandomMessage(category);
  
  // Set and show message
  speechBubble.textContent = message;
  speechBubble.classList.add('show');
  
  // Hide after delay
  setTimeout(() => {
    speechBubble.classList.remove('show');
  }, 3000);
}

// Change mascot state
function changeMascotState(state, animationVariant = null) {
  const mascot = document.querySelector('.mascot');
  
  // Remove all state and animation classes
  mascot.className = 'mascot'; // Reset all classes
  
  // Add new state
  mascot.classList.add(state);
  
  // Add animation variant if provided
  if (animationVariant) {
    mascot.classList.add(animationVariant);
  }
  
  // Show appropriate message
  showMascotMessage(state === 'happy' ? 'correct' : 
                     state === 'thinking' ? 'wrong' : state);
}

// React to correct answer
function mascotCorrectAnswer() {
  correctStreak++;
  wrongCount = 0;
  
  // Cap the streak at MAX_JUMP_LEVEL for animation purposes
  const jumpLevel = Math.min(correctStreak, MAX_JUMP_LEVEL);
  
  // Show excited animation if on a good streak
  if (correctStreak >= EXCITED_THRESHOLD) {
    // Pick a random excited animation variation
    const excitedVariant = `excited-${Math.floor(Math.random() * ANIMATION_VARIATION) + 1}`;
    changeMascotState('excited', excitedVariant);
    
    // After a brief delay, show the jumping animation based on streak level
    setTimeout(() => {
      changeMascotState('happy', `jump-${jumpLevel}`);
    }, 1500);
  } else {
    // Show jump animation with height based on streak
    changeMascotState('happy', `jump-${jumpLevel}`);
  }
  
  // Console log for debugging
  console.log(`Correct streak: ${correctStreak}, Jump level: ${jumpLevel}`);
}

// React to wrong answer
function mascotWrongAnswer() {
  // Reset streak
  correctStreak = 0;
  wrongCount++;
  
  // Select different wrong animations in rotation
  const wrongVariant = `wrong-${(wrongCount % ANIMATION_VARIATION) + 1}`;
  changeMascotState('thinking', wrongVariant);
}

// Return to idle state
function mascotIdle() {
  changeMascotState('idle');
}

// Initialize mascot when the page loads
document.addEventListener('DOMContentLoaded', function() {
  const mascot = initMascot();
  
  // Return to idle state after each question
  document.getElementById('nextBtn').addEventListener('click', function() {
    setTimeout(() => mascotIdle(), 500);
  });
});
