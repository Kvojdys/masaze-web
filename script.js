// ---------- Config ----------
const FORMSPREE_ENDPOINT = ""; // vyplňte svůj endpoint, jinak se použije mailto

// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const form = $("#contactForm");
const statusEl = $("#formStatus");
const yearEl = $("#year");
const nav = document.querySelector('.site-header nav');
const navToggle = document.querySelector('.nav-toggle');

if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile nav
navToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Validation
function validate() {
  let valid = true;
  const fields = ['name', 'email', 'message'];
  fields.forEach(id => {
    const input = document.getElementById(id);
    const error = input.nextElementSibling;
    if (!input.value.trim()) { error.textContent = 'Toto pole je povinné.'; valid = false; }
    else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) { error.textContent = 'Zadejte platný e-mail.'; valid = false; }
    else { error.textContent = ''; }
  });
  return valid;
}

// Senders
async function sendViaFormspree(payload) {
  const res = await fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Chyba odeslání.');
  return res.json();
}
function sendViaMailto(payload) {
  const to = 'masaze@example.cz'; // změňte na svůj e-mail
  const subject = encodeURIComponent('Nová zpráva z webu – kontakt');
  const body = encodeURIComponent(`Jméno: ${payload.name}\nE-mail: ${payload.email}\n\nZpráva:\n${payload.message}`);
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

// Submit
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const payload = {
    name: $('#name').value.trim(),
    email: $('#email').value.trim(),
    message: $('#message').value.trim()
  };

  statusEl.textContent = 'Odesílám...';
  statusEl.className = 'form-status';

  try {
    if (FORMSPREE_ENDPOINT) {
      await sendViaFormspree(payload);
      statusEl.textContent = 'Zpráva byla odeslána. Děkuji!';
      statusEl.classList.add('success');
      form.reset();
    } else {
      sendViaMailto(payload);
      statusEl.textContent = 'Otevírám e-mailovou aplikaci…';
      statusEl.classList.add('success');
    }
  } catch (err) {
    statusEl.textContent = 'Nepodařilo se odeslat. Zkuste to prosím znovu.';
    statusEl.classList.add('fail');
  }
});
