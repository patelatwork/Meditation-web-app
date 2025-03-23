document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const durationBtns = document.querySelectorAll('.duration-btn');
    const meditationTimer = document.querySelector('.meditation-timer');
    const timerDisplay = document.querySelector('.timer-display');
    const timerCircle = document.querySelector('.timer-circle');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const stopBtn = document.getElementById('stop-btn');
    const meditationComplete = document.querySelector('.meditation-complete');
    const newSessionBtn = document.getElementById('new-session-btn');
    const meditationHistory = document.getElementById('meditation-history');
    const durationSelection = document.querySelector('.duration-selection');
    
    // Variables
    let selectedDuration = 0;
    let timeLeft = 0;
    let timerInterval;
    let isPaused = false;
    let ambientSound = new Audio('/sounds/ambient.mp3');
    ambientSound.loop = true;
    
    // Check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/meditation/history');
        
        if (!response.ok) {
          // Not logged in, redirect to login
          window.location.href = '/login';
          return;
        }
        
        // Get username from JWT
        const userInfo = await getUserInfo();
        if (userInfo && userInfo.username) {
          usernameDisplay.textContent = userInfo.username;
        }
        
        // Load meditation history
        loadMeditationHistory();
        
      } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '/login';
      }
    };
    
    // Get user info from JWT
    const getUserInfo = async () => {
      try {
        const response = await fetch('/api/meditation/history');
        if (response.ok) {
          const data = await response.json();
          // Extract username from JWT on client side
          const token = document.cookie.split('; ').find(row => row.startsWith('token='));
          if (token) {
            const base64Url = token.split('=')[1].split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            return JSON.parse(jsonPayload);
          }
        }
      } catch (error) {
        console.error('Error getting user info:', error);
      }
      return null;
    };
    
    const loadMeditationHistory = async () => {
      try {
        const response = await fetch('/api/meditation/history', {
          credentials: 'include' // Important for sending cookies
        });
        
        if (!response.ok) {
          throw new Error('Failed to load history');
        }
    
        const data = await response.json();
        console.log('Loaded meditation history:', data);
        
        if (data.history && data.history.length > 0) {
          meditationHistory.innerHTML = '';
          
          // Show the most recent 10 sessions
          const recentHistory = data.history.slice(-10).reverse();
          
          recentHistory.forEach(session => {
            const dateObj = new Date(session.date);
            const formattedDate = dateObj.toLocaleDateString();
            const formattedTime = dateObj.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
              <div>${formattedDate} at ${formattedTime}</div>
              <div>${session.duration} minutes</div>
            `;
            
            meditationHistory.appendChild(historyItem);
          });
        } else {
          meditationHistory.innerHTML = '<p class="text-center">No meditation sessions recorded yet.</p>';
        }
      } catch (error) {
        console.error('Error loading meditation history:', error);
        meditationHistory.innerHTML = '<p class="text-center">Error loading meditation history. Please try again.</p>';
      }
    };
    // Format time for display (MM:SS)
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    
    // Update timer animation
    const updateTimerAnimation = (timeLeft, totalTime) => {
      const progressPercentage = (timeLeft / totalTime) * 100;
      timerCircle.style.setProperty('--progress', `${progressPercentage}%`);
      timerCircle.style.background = `conic-gradient(
        var(--primary-color) ${100 - progressPercentage}%, 
        var(--secondary-color) ${100 - progressPercentage}%
      )`;
    };
    
   // Add these variables after other variable declarations
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let meditationAudio = null;
let guidedAudio = null;

// Add this function to handle audio setup
const setupAudio = async (duration) => {
  // Stop any playing audio
  if (meditationAudio) {
    meditationAudio.pause();
    meditationAudio.currentTime = 0;
  }
  if (guidedAudio) {
    guidedAudio.pause();
    guidedAudio.currentTime = 0;
  }

  // Create new audio elements
  meditationAudio = new Audio('/sounds/ambient.mp3');
  meditationAudio.loop = true;
  
  // Select guided meditation based on duration
  switch(duration) {
    case 7:
      guidedAudio = new Audio('/sounds/meditation-music-without-nature-sound-256142.mp3');
      break;
    case 15:
      guidedAudio = new Audio('/sounds/Brahma Kumaris Guided MEDITATION Experience (Hindi)_ BK Shivani.mp3');
      break;
    case 21:
      guidedAudio = new Audio('/sounds/Mindfulness meditation _Free Guided meditation in hindi 20 mins I Peeyush prabhat.mp3');
      break;
  }
  
  // Set volumes
  meditationAudio.volume = 0.3;
  guidedAudio.volume = 1.0;
};

// Update the startTimer function
const startTimer = () => {
  const totalTime = selectedDuration * 60;
  timeLeft = totalTime;
  timerDisplay.textContent = formatTime(timeLeft);
  
  // Setup and start audio
  setupAudio(selectedDuration);
  meditationAudio.play();
  guidedAudio.play();
  
  // Show/hide buttons
  startBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  stopBtn.classList.remove('hidden');
  
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timerDisplay.textContent = formatTime(timeLeft);
      updateTimerAnimation(timeLeft, totalTime);
    } else {
      clearInterval(timerInterval);
      completeSession();
    }
  }, 1000);
};

// Update the pauseTimer function
const pauseTimer = () => {
  clearInterval(timerInterval);
  isPaused = true;
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.remove('hidden');
  
  // Pause audio
  meditationAudio.pause();
  guidedAudio.pause();
};

// Update the resumeTimer function
const resumeTimer = () => {
  isPaused = false;
  resumeBtn.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  
  // Resume audio
  meditationAudio.play();
  guidedAudio.play();
  
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timerDisplay.textContent = formatTime(timeLeft);
      updateTimerAnimation(timeLeft, selectedDuration * 60);
    } else {
      clearInterval(timerInterval);
      completeSession();
    }
  }, 1000);
};

// Update the stopTimer function
const stopTimer = () => {
  clearInterval(timerInterval);
  
  // Stop audio
  meditationAudio.pause();
  meditationAudio.currentTime = 0;
  guidedAudio.pause();
  guidedAudio.currentTime = 0;
  
  // Record partial session
  if (timeLeft < selectedDuration * 60) {
    const completedTime = selectedDuration - Math.ceil(timeLeft / 60);
    if (completedTime > 0) {
      recordSession(completedTime);
    }
  }
  
  resetTimerUI();
};

// Update the completeSession function
// Update the completeSession function
const completeSession = () => {
  clearInterval(timerInterval);
  
  // Stop audio
  meditationAudio.pause();
  meditationAudio.currentTime = 0;
  guidedAudio.pause();
  guidedAudio.currentTime = 0;
  
  // Record session
  recordSession(selectedDuration);
  
  // Show completion screen
  meditationTimer.classList.add('hidden');
  meditationComplete.classList.remove('hidden');
  
  // Reset duration selection
  selectedDuration = 0;
  durationBtns.forEach(btn => btn.classList.remove('active'));
  
  // Show duration selection buttons
  durationSelection.classList.remove('hidden');
  
  // Update timer display to show 00:00
  timerDisplay.textContent = formatTime(0);
  
  // Reset timer animation
  timerCircle.style.background = 'conic-gradient(var(--primary-color) 0%, var(--secondary-color) 0%)';
  
  // Reset button states
  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  resumeBtn.classList.add('hidden');
  stopBtn.classList.add('hidden');
};

// Update the newSessionBtn event listener
newSessionBtn.addEventListener('click', () => {
  // Hide completion screen
  meditationComplete.classList.add('hidden');
  
  // Reset timer UI
  resetTimerUI();
  
  // Show duration selection
  durationSelection.classList.remove('hidden');
});
    
    // Reset timer UI
    const resetTimerUI = () => {
      meditationTimer.classList.add('hidden');
      meditationComplete.classList.add('hidden');
      durationSelection.classList.remove('hidden');
      
      // Reset active state on duration buttons
      durationBtns.forEach(btn => {
        btn.classList.remove('active');
      });
      
      selectedDuration = 0;
    };
    
    // Record meditation session to backend
    const recordSession = async (duration) => {
      try {
        const response = await fetch('/api/meditation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include', // Important for sending cookies
          body: JSON.stringify({ duration: parseInt(duration) })
        });
    
        if (!response.ok) {
          throw new Error('Failed to record session');
        }
    
        const data = await response.json();
        console.log('Session recorded:', data);
        
        // Refresh meditation history
        await loadMeditationHistory();
      } catch (error) {
        console.error('Error recording session:', error);
      }
    };
    // Logout function
    const logout = async () => {
      try {
        await fetch('/api/logout', {
          method: 'POST'
        });
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
    
    // Event Listeners
    durationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active class from all buttons
        durationBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Set selected duration
        selectedDuration = parseInt(btn.dataset.duration);
        
        // Show timer
        meditationTimer.classList.remove('hidden');
        timerDisplay.textContent = formatTime(selectedDuration * 60);
        
        // Reset timer animation
        timerCircle.style.background = 'conic-gradient(var(--primary-color) 0%, var(--secondary-color) 0%)';
      });
    });
    
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resumeBtn.addEventListener('click', resumeTimer);
    stopBtn.addEventListener('click', stopTimer);
    newSessionBtn.addEventListener('click', resetTimerUI);
    logoutBtn.addEventListener('click', logout);
    
    // Init
    checkAuth();
  });