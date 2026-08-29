// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if(toggle){
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '68px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = '#f5f6fb';
    links.style.padding = '18px 24px';
    links.style.borderBottom = '1px solid #e3e5f2';
    links.style.gap = '18px';
  });
}

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Contact form — sends to the backend API (saves to database + emails a notification)
const form = document.getElementById('contact-form');
if(form){
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = document.getElementById('form-note');
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();

    if(!name || !phone){
      note.textContent = "Please fill in your name and phone number before sending.";
      note.style.color = '#c0392b';
      return;
    }

    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    note.textContent = '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, service, message })
      });
      if(!res.ok){ throw new Error('Request failed'); }

      note.textContent = "Thanks — your message has been sent. We'll get back to you soon.";
      note.style.color = '#2135e6';
      form.reset();
    } catch(err){
      note.textContent = "Something went wrong sending your message — please call or email us directly.";
      note.style.color = '#c0392b';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}
