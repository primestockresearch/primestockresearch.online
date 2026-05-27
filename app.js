document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. FAQ Accordion =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(faq => {
        faq.classList.remove('active');
        const ans = faq.querySelector('.faq-answer');
        ans.style.maxHeight = null;
      });
      if (!isActive) {
        item.classList.add('active');
        const ans = item.querySelector('.faq-answer');
        ans.style.maxHeight = ans.scrollHeight + 'px';
      }
    });
  });

  // ===== 2. Slots Counter (Urgency) =====
  let slotsLeft = parseInt(sessionStorage.getItem('slots_left')) || 14;
  const slotsEl = document.getElementById('slots-count');
  const slotsMobileEl = document.getElementById('slots-count-mobile');

  function updateSlots() {
    if (slotsEl) slotsEl.textContent = slotsLeft;
    if (slotsMobileEl) slotsMobileEl.textContent = slotsLeft;
  }
  updateSlots();

  // Slowly reduce slots count every 3 minutes for FOMO
  setInterval(() => {
    if (slotsLeft > 3) {
      slotsLeft--;
      sessionStorage.setItem('slots_left', slotsLeft);
      updateSlots();
    }
  }, 180000);

  // ===== 3. Mobile Drawer =====
  const mobileRegBtn = document.getElementById('mobile-reg-btn');
  const mobileSubmitOverlay = document.getElementById('mobile-submit-overlay');
  const mobileSubmitCard = document.getElementById('mobile-submit-card');
  const closeMobileForm = document.getElementById('close-mobile-form');

  function openDrawer() {
    if (mobileSubmitOverlay) mobileSubmitOverlay.classList.add('open');
    if (mobileSubmitCard) mobileSubmitCard.classList.add('open');
  }
  function closeDrawer() {
    if (mobileSubmitOverlay) mobileSubmitOverlay.classList.remove('open');
    if (mobileSubmitCard) mobileSubmitCard.classList.remove('open');
  }

  if (mobileRegBtn) mobileRegBtn.addEventListener('click', openDrawer);
  if (closeMobileForm) closeMobileForm.addEventListener('click', closeDrawer);
  if (mobileSubmitOverlay) mobileSubmitOverlay.addEventListener('click', closeDrawer);

  // ===== 4. CTA Inline Buttons =====
  const ctaButtons = document.querySelectorAll('.cta-btn-trigger');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        openDrawer();
        const mobileNameInput = document.getElementById('mobile-reg-name');
        if (mobileNameInput) setTimeout(() => mobileNameInput.focus(), 300);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const regCard = document.querySelector('.register-card');
        if (regCard) {
          regCard.style.outline = '3px solid var(--primary-color)';
          regCard.style.borderRadius = '24px';
          setTimeout(() => { regCard.style.outline = 'none'; }, 1200);
        }
        setTimeout(() => {
          const nameInput = document.getElementById('reg-name');
          if (nameInput) nameInput.focus();
        }, 650);
      }
    });
  });

  // ===== 5. Form Validation & Submission =====
  const successModalOverlay = document.getElementById('success-modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const successMessageName = document.getElementById('success-msg-name');

  function validateAndSubmit(e, formId) {
    e.preventDefault();
    const form = e.target;
    const nameInput = form.querySelector('input[type="text"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const segmentInput = form.querySelector('select');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const segment = segmentInput ? segmentInput.value : '';

    if (!name) {
      showInputError(nameInput, 'Please enter your full name.');
      return;
    }
    const phoneRegex = /^[6789]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      showInputError(phoneInput, 'Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    if (!segment) {
      showInputError(segmentInput, 'Please select your preferred segment.');
      return;
    }

    // Save to localStorage
    localStorage.setItem('primestock_lead', JSON.stringify({
      name, phone: '+91' + phone, segment,
      form: formId, timestamp: new Date().toISOString()
    }));

    // Show success modal
    if (successMessageName) successMessageName.textContent = name;
    if (successModalOverlay) successModalOverlay.classList.add('open');

    // Reduce slots
    if (slotsLeft > 1) {
      slotsLeft--;
      sessionStorage.setItem('slots_left', slotsLeft);
      updateSlots();
    }

    form.reset();
    closeDrawer();
  }

  function showInputError(input, message) {
    if (!input) return;
    input.style.borderColor = '#EF4444';
    input.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
    input.focus();
    const existing = input.parentElement.querySelector('.error-msg');
    if (!existing) {
      const err = document.createElement('p');
      err.className = 'error-msg';
      err.textContent = message;
      err.style.cssText = 'color:#EF4444;font-size:12px;margin-top:4px;';
      input.parentElement.insertBefore(err, input.nextSibling);
    }
    setTimeout(() => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
      const err = input.parentElement.querySelector('.error-msg');
      if (err) err.remove();
    }, 3000);
  }

  const desktopForm = document.getElementById('desktop-reg-form');
  const mobileForm = document.getElementById('mobile-reg-form');
  if (desktopForm) desktopForm.addEventListener('submit', e => validateAndSubmit(e, 'desktop'));
  if (mobileForm) mobileForm.addEventListener('submit', e => validateAndSubmit(e, 'mobile'));

  if (closeModalBtn && successModalOverlay) {
    closeModalBtn.addEventListener('click', () => {
      successModalOverlay.classList.remove('open');
    });
  }

  // ===== 6. Check If Already Registered =====
  const savedLead = localStorage.getItem('primestock_lead');
  if (savedLead) {
    const lead = JSON.parse(savedLead);
    const submitBtns = document.querySelectorAll('#desktop-reg-form button[type="submit"], #mobile-reg-form button[type="submit"]');
    submitBtns.forEach(btn => {
      btn.textContent = '✅ Already Registered — Get Another Trial';
    });
  }

  // ===== 7. Ticker Pause on Hover =====
  const tickerContent = document.querySelector('.ticker-content');
  const tickerTrack = document.querySelector('.ticker-track');
  if (tickerContent && tickerTrack) {
    tickerTrack.addEventListener('mouseenter', () => {
      tickerContent.style.animationPlayState = 'paused';
    });
    tickerTrack.addEventListener('mouseleave', () => {
      tickerContent.style.animationPlayState = 'running';
    });
  }

});
