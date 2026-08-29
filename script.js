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

// Contact form — builds a pre-filled email since there's no backend wired up yet
const form = document.getElementById('contact-form');
if(form){
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value.trim();
    const note = document.getElementById('form-note');

    if(!name || !phone){
      note.textContent = "Please fill in your name and phone number before sending.";
      note.style.color = '#c0392b';
      return;
    }

    const subject = encodeURIComponent(`Enquiry — ${service}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nService: ${service}\n\nMessage:\n${message || 'Not provided'}`
    );
    window.location.href = `mailto:info@femtechhub.com?subject=${subject}&body=${body}`;

    note.textContent = "Opening your email app with this message pre-filled — hit send there to reach us.";
    note.style.color = '#2135e6';
  });
}
