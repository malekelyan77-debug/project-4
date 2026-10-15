'use strict';
 
/* ---------- 1. Theme switcher (mandatory feature) ---------- */
const THEMES = [
  { id: 'daylight', label: 'Daylight' },
  { id: 'night',    label: 'Night' },
  { id: 'signal',   label: 'Signal' },
];
 
const root = document.documentElement;          // <html>, holds data-theme
const themeBtn = document.getElementById('theme-toggle');
const themeLabel = document.getElementById('theme-label');
 
function applyTheme(index) {
  const theme = THEMES[index];
  root.setAttribute('data-theme', theme.id);    // DOM mutation: CSS variables change
  themeLabel.textContent = theme.label;         // DOM mutation: button text
  try { localStorage.setItem('theme-index', String(index)); } catch (e) { /* storage blocked */ }
}
 
let themeIndex = 0;
try {
  const saved = parseInt(localStorage.getItem('theme-index'), 10);
  if (!Number.isNaN(saved) && THEMES[saved]) themeIndex = saved;
} catch (e) { /* storage blocked */ }
applyTheme(themeIndex);
 
// User clicks the button -> "click" event fires -> this callback runs -> theme attribute changes.
themeBtn.addEventListener('click', () => {
  themeIndex = (themeIndex + 1) % THEMES.length;
  applyTheme(themeIndex);
});
 
/* ---------- 2. Mobile menu ---------- */
const menuBtn = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');
 
menuBtn.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');       // CSS class mutation
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});
 
// Close the menu after choosing a link on mobile.
navLinks.addEventListener('click', (event) => {
  if (event.target.tagName === 'A') {
    navLinks.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
});
 
/* ---------- 3. Contact form validation ---------- */
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
function setError(fieldId, message) {
  const input = document.getElementById(fieldId);
  document.getElementById(fieldId + '-error').textContent = message;
  input.closest('.field').classList.toggle('invalid', Boolean(message));
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}
 
function validateForm() {
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
 
  const okName = setError('name', name ? '' : 'Enter your name.');
  const okEmail = setError('email', EMAIL_PATTERN.test(email) ? '' : 'Enter a valid email address, like name@example.com.');
  const okMessage = setError('message', message.length >= 10 ? '' : 'Write at least 10 characters.');
  return okName && okEmail && okMessage;
}
 
form.addEventListener('submit', (event) => {
  event.preventDefault();                       // stop the page from reloading
  status.textContent = '';
  if (!validateForm()) return;
  // No back end in this exercise, so confirm on screen and reset.
  status.textContent = 'Message sent. Thank you, ' + form.elements.name.value.trim() + '.';
  form.reset();
});
 
// Clear an error as soon as the visitor edits that field.
form.addEventListener('input', (event) => {
  if (event.target.id) setError(event.target.id, '');
});
 
/* ---------- 4. Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
 
/* ---------- 5. Exercise 01: interactive avatar selector ----------
   Lifecycle:
   1. User action      -> visitor clicks "Casual", "Professional" or "Hoodie"
   2. Event firing     -> a "click" event is dispatched (we listen once on the group and
                          read which button was hit using event.target / event delegation)
   3. JS callback      -> setAvatar() runs
   4. DOM/CSS mutation -> .is-changing fades the old photo out (CSS transition),
                          then img.src and img.alt are swapped, then the class is removed
                          so the new photo fades in.
   ---------------------------------------------------------------- */
const AVATARS = {
  casual: {
    src: 'assets/avatar-casual.svg',
    alt: 'Casual avatar of Malek in a teal t-shirt',
    label: 'Casual',
  },
  professional: {
    src: 'assets/avatar-professional.svg',
    alt: 'Professional avatar of Malek in a dark suit and red tie',
    label: 'Professional',
  },
  creative: {
    src: 'assets/avatar-creative.svg',
    alt: 'Avatar of Malek in a purple hoodie and glasses',
    label: 'Hoodie',
  },
};
 
const avatarImg = document.getElementById('avatar-img');
const avatarPicker = document.querySelector('.avatar-picker');
const avatarCaption = document.getElementById('avatar-caption');
const FADE_MS = 350;                              // must match the CSS transition duration
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let currentAvatar = 'casual';
let swapTimer = null;
 
function markActive(key) {
  avatarPicker.querySelectorAll('.avatar-btn').forEach((btn) => {
    const active = btn.dataset.avatar === key;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  avatarCaption.textContent = 'Showing: ' + AVATARS[key].label;
}
 
function setAvatar(key) {
  if (!AVATARS[key] || key === currentAvatar) return;
  currentAvatar = key;
  markActive(key);
  clearTimeout(swapTimer);
 
  const { src, alt } = AVATARS[key];
  const swap = () => {
    avatarImg.src = src;                          // DOM mutation: new image file
    avatarImg.alt = alt;                          // DOM mutation: new accessible text
    // Fade the new image in once it has loaded.
    const reveal = () => avatarImg.classList.remove('is-changing');
    if (avatarImg.complete) reveal();
    else avatarImg.addEventListener('load', reveal, { once: true });
  };
 
  if (prefersReducedMotion) { swap(); return; }
  avatarImg.classList.add('is-changing');         // CSS transition: fade out
  swapTimer = setTimeout(swap, FADE_MS);          // swap when the fade-out has finished
}
 
avatarPicker.addEventListener('click', (event) => {
  const btn = event.target.closest('.avatar-btn');
  if (btn) setAvatar(btn.dataset.avatar);
});
