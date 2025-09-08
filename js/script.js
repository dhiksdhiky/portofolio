document.addEventListener('DOMContentLoaded', function() {

    // --- DOM Element Selectors ---
    const header = document.getElementById('header');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');
    const hamburger = document.getElementById('hamburger');
    const sections = document.querySelectorAll('section[id]');
    const backToTopButton = document.getElementById('back-to-top');
    const currentYearSpan = document.getElementById('current-year');
    const contactForm = document.getElementById('contact-form');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // --- State Variables ---
    const headerHeight = header ? header.offsetHeight : 70;

    // --- Scroll Handling Function ---
    function handleScroll() {
        if (header) {
            if (window.scrollY > headerHeight) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        if (backToTopButton) {
            if (window.scrollY > 300) {
                 backToTopButton.classList.add('visible');
            } else {
                 backToTopButton.classList.remove('visible');
            }
        }

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                 currentSectionId = section.getAttribute('id');
             }
        });

         if (currentSectionId === '' && window.scrollY >= (document.documentElement.scrollHeight - window.innerHeight - headerHeight - 100)) {
            const lastSection = sections[sections.length - 1];
             if(lastSection) {
                 currentSectionId = lastSection.getAttribute('id');
            }
         }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').slice(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // --- Hamburger Menu Toggle ---
    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
    }

    // --- Close Mobile Menu When a Link is Clicked ---
    if (navLinksContainer) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinksContainer.classList.contains('active')) {
                    navLinksContainer.classList.remove('active');
                    const icon = hamburger ? hamburger.querySelector('i') : null;
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
    }

    // --- Set Current Year in Footer ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Intersection Observer for Scroll Animations ---
    if (animatedElements.length > 0 && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observerInstance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }

    // --- AJAX Form Submission for Contact Form ---
    if (contactForm) {
        let statusMessage = contactForm.parentNode.querySelector('.form-status-message');
        if (!statusMessage) {
            statusMessage = document.createElement('p');
            statusMessage.className = 'form-status-message';
            contactForm.parentNode.insertBefore(statusMessage, contactForm.nextSibling);
        }
        statusMessage.textContent = '';

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            statusMessage.textContent = 'Mengirim...';
            statusMessage.style.color = '#555';

            fetch(form.action, {
                method: form.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    statusMessage.textContent = "Pesan berhasil terkirim! Terima kasih.";
                    statusMessage.style.color = 'green';
                    form.reset();
                } else {
                    response.json().then(errorData => {
                        statusMessage.textContent = (errorData.errors ? errorData.errors.map(err => err.message).join(", ") : "Oops! Ada masalah saat mengirim formulir.");
                        statusMessage.style.color = 'red';
                    }).catch(() => {
                         statusMessage.textContent = "Oops! Terjadi kesalahan tak terduga.";
                         statusMessage.style.color = 'red';
                    });
                }
            }).catch(() => {
                statusMessage.textContent = "Oops! Sepertinya ada masalah jaringan.";
                statusMessage.style.color = 'red';
            });
            setTimeout(() => { statusMessage.textContent = ''; }, 7000);
        });
    }

}); // End of DOMContentLoaded
