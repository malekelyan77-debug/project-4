
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
