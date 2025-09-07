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

    // AI Feature Elements
    const generateIdeaButton = document.getElementById('generate-idea-button');
    const aiInterestInput = document.getElementById('ai-interest');
    const aiGeneratedIdeaDiv = document.getElementById('ai-generated-idea');
    const aiIdeaTextElement = document.getElementById('ai-idea-text');
    const aiLoadingIndicator = document.getElementById('ai-loading-indicator');
    const aiErrorMessage = document.getElementById('ai-error-message');

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

    // --- AI Project Idea Generator ---
    if (generateIdeaButton && aiInterestInput && aiGeneratedIdeaDiv && aiIdeaTextElement && aiLoadingIndicator && aiErrorMessage) {
        generateIdeaButton.addEventListener('click', async () => {
            const interest = aiInterestInput.value.trim();
            if (!interest) {
                aiErrorMessage.textContent = "Silakan masukkan bidang minat Anda.";
                aiErrorMessage.style.display = 'block';
                aiGeneratedIdeaDiv.style.display = 'none';
                aiLoadingIndicator.style.display = 'none';
                return;
            }

            // Reset UI
            aiLoadingIndicator.style.display = 'block';
            aiGeneratedIdeaDiv.style.display = 'none';
            aiErrorMessage.style.display = 'none';
            aiIdeaTextElement.innerHTML = ''; // Use innerHTML if the response might contain simple HTML like line breaks

            // Construct the prompt for the AI
            const prompt = `Sebagai seorang ahli dalam pengembangan karir dan inovasi proyek, berikan satu ide proyek yang unik dan praktis untuk seseorang yang tertarik pada bidang "${interest}". Ide proyek ini harus cocok untuk portofolio dan dapat menunjukkan keterampilan praktis. Sertakan judul proyek yang menarik dan deskripsi singkat (2-4 kalimat). Format respons sebagai berikut:\n\n**Judul Proyek:** [Judul di sini]\n**Deskripsi:** [Deskripsi di sini]`;

            try {
                // Prepare payload for Gemini API
                let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
                const payload = { contents: chatHistory };
                const apiKey = os.environ.get("GEMINI_API_KEY"); // API key will be injected by the environment if needed
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("API Error:", errorData);
                    throw new Error(`API request failed with status ${response.status}.`);
                }

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    
                    let generatedText = result.candidates[0].content.parts[0].text;
                    
                    // Simple formatting for display (replace newlines with <br>)
                    generatedText = generatedText.replace(/\n/g, '<br>');
                    // Make "**Judul Proyek:**" and "**Deskripsi:**" bold
                    generatedText = generatedText.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>');


                    aiIdeaTextElement.innerHTML = generatedText; // Use innerHTML to render <br> and <strong>
                    aiGeneratedIdeaDiv.style.display = 'block';
                } else {
                    console.error("Unexpected API response structure:", result);
                    throw new Error("Tidak ada konten yang dihasilkan atau format respons tidak terduga.");
                }

            } catch (error) {
                console.error("Error generating project idea:", error);
                aiErrorMessage.textContent = `Maaf, terjadi kesalahan saat menghubungi AI: ${error.message}. Silakan coba lagi nanti.`;
                aiErrorMessage.style.display = 'block';
            } finally {
                aiLoadingIndicator.style.display = 'none';
            }
        });
    }

}); // End of DOMContentLoaded



