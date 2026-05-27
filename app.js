document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Date Calculation (Next Wednesday or Saturday, whichever is closer)
  const datePlaceholder = document.getElementById('session-date');
  if (datePlaceholder) {
    datePlaceholder.textContent = getUpcomingSessionDate();
  }

  function getUpcomingSessionDate() {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Find next Wednesday (3) or Saturday (6)
    let target = new Date();
    let daysToAdd = 1;
    
    // If today is Wednesday/Saturday and it's before 2:00 PM, we can display today
    const currentHour = now.getHours();
    const todayDay = now.getDay();
    if ((todayDay === 3 || todayDay === 6) && currentHour < 14) {
      target = now;
    } else {
      while (true) {
        let checkDate = new Date();
        checkDate.setDate(now.getDate() + daysToAdd);
        let dayOfWeek = checkDate.getDay();
        if (dayOfWeek === 3 || dayOfWeek === 6) {
          target = checkDate;
          break;
        }
        daysToAdd++;
      }
    }
    
    const day = target.getDate();
    const month = months[target.getMonth()];
    const year = target.getFullYear();
    
    return `${day} ${month} ${year}`;
  }

  // 2. Countdown Timer (10 Minutes FOMO timer)
  let timerDuration = 600; // 10 minutes in seconds
  const timerLabel = document.getElementById('timer-countdown');
  const stickyTimerLabel = document.getElementById('sticky-timer-countdown');
  
  // Use sessionStorage to persist timer across page reloads in the same session
  if (sessionStorage.getItem('fomo_timer')) {
    timerDuration = parseInt(sessionStorage.getItem('fomo_timer'), 10);
  }

  function updateTimer() {
    const minutes = Math.floor(timerDuration / 60);
    const seconds = timerDuration % 60;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    const timeString = `${formattedMinutes}:${formattedSeconds}`;
    
    if (timerLabel) timerLabel.textContent = timeString;
    if (stickyTimerLabel) stickyTimerLabel.textContent = timeString;
    
    if (timerDuration <= 0) {
      // Reset timer back to 10 minutes for continued FOMO
      timerDuration = 600;
    } else {
      timerDuration--;
      sessionStorage.setItem('fomo_timer', timerDuration);
    }
  }
  
  updateTimer();
  setInterval(updateTimer, 1000);

  // 3. FAQ Accordion toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all open FAQs
      faqItems.forEach(faq => {
        faq.classList.remove('active');
        const answer = faq.querySelector('.faq-answer');
        answer.style.maxHeight = null;
      });
      
      // If the clicked FAQ wasn't already active, open it
      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // 4. Mobile Submit Drawer Trigger
  const mobileRegBtn = document.getElementById('mobile-reg-btn');
  const mobileSubmitOverlay = document.getElementById('mobile-submit-overlay');
  const mobileSubmitCard = document.getElementById('mobile-submit-card');
  const closeMobileForm = document.getElementById('close-mobile-form');

  if (mobileRegBtn && mobileSubmitOverlay && mobileSubmitCard && closeMobileForm) {
    mobileRegBtn.addEventListener('click', () => {
      mobileSubmitOverlay.classList.add('open');
      mobileSubmitCard.classList.add('open');
    });

    const closeDrawer = () => {
      mobileSubmitOverlay.classList.remove('open');
      mobileSubmitCard.classList.remove('open');
    };

    closeMobileForm.addEventListener('click', closeDrawer);
    mobileSubmitOverlay.addEventListener('click', closeDrawer);
  }

  // 5. Form Submissions and Validation
  const desktopForm = document.getElementById('desktop-reg-form');
  const mobileForm = document.getElementById('mobile-reg-form');
  const successModalOverlay = document.getElementById('success-modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const successMessageName = document.getElementById('success-msg-name');

  function handleRegistration(e, formType) {
    e.preventDefault();
    const form = e.target;
    const nameInput = form.querySelector('input[type="text"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    
    // Validation
    if (!name) {
      alert('Please enter your full name');
      if (nameInput) nameInput.focus();
      return;
    }
    
    // Indian WhatsApp number validation (10 digits)
    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid 10-digit WhatsApp number (starting with 6, 7, 8, or 9)');
      if (phoneInput) phoneInput.focus();
      return;
    }
    
    // Mock Save to LocalStorage
    localStorage.setItem('primestock_registration', JSON.stringify({
      name: name,
      phone: phone,
      date: new Date().toISOString(),
      form: formType
    }));

    // Personalize Success Modal
    if (successMessageName) {
      successMessageName.textContent = name;
    }
    
    // Show Modal
    if (successModalOverlay) {
      successModalOverlay.classList.add('open');
    }

    // Reset Form
    form.reset();

    // Close mobile drawer if open
    if (mobileSubmitCard) {
      mobileSubmitCard.classList.remove('open');
    }
    if (mobileSubmitOverlay) {
      mobileSubmitOverlay.classList.remove('open');
    }
  }

  if (desktopForm) {
    desktopForm.addEventListener('submit', (e) => handleRegistration(e, 'desktop'));
  }
  
  if (mobileForm) {
    mobileForm.addEventListener('submit', (e) => handleRegistration(e, 'mobile'));
  }

  if (closeModalBtn && successModalOverlay) {
    closeModalBtn.addEventListener('click', () => {
      successModalOverlay.classList.remove('open');
    });
  }

  // 6. Inline CTA Button Action Triggers (Scroll to top on desktop, open drawer on mobile)
  const ctaButtons = document.querySelectorAll('.cta-btn-trigger');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        // Mobile: Open bottom drawer sheet
        if (mobileSubmitOverlay && mobileSubmitCard) {
          mobileSubmitOverlay.classList.add('open');
          mobileSubmitCard.classList.add('open');
          const mobileNameInput = document.getElementById('mobile-reg-name');
          if (mobileNameInput) mobileNameInput.focus();
        }
      } else {
        // Desktop: Smooth scroll to the top form and focus input
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        const desktopNameInput = document.getElementById('reg-name');
        if (desktopNameInput) {
          // Add a subtle brief highlight animation on the registration card
          const regCard = document.querySelector('.register-card');
          if (regCard) {
            regCard.style.outline = '3px solid var(--primary-color)';
            regCard.style.transition = 'outline 0.15s ease-in-out';
            setTimeout(() => {
              regCard.style.outline = 'none';
            }, 1000);
          }
          setTimeout(() => {
            desktopNameInput.focus();
          }, 600); // Focus after scrolling finishes
        }
      }
    });
  });

  // Check if user is already registered (display small sticky status)
  const savedReg = localStorage.getItem('primestock_registration');
  if (savedReg) {
    const regData = JSON.parse(savedReg);
    console.log('User registered previously:', regData.name);
    // Optionally customize header button or state
    const regButtons = document.querySelectorAll('.hero-reg-trigger');
    regButtons.forEach(btn => {
      btn.textContent = 'Already Registered (View Details)';
    });
  }
});
