document.addEventListener('DOMContentLoaded', function() {

    // --- DOM Element Selectors ---
    const header = document.getElementById('header');
    const navbar = document.getElementById('navbar'); // Although not directly used in JS logic here, good practice to have if needed later
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');
    const hamburger = document.getElementById('hamburger');
    const sections = document.querySelectorAll('section[id]'); // Select sections that have an ID attribute
    const backToTopButton = document.getElementById('back-to-top');
    const currentYearSpan = document.getElementById('current-year');
    const contactForm = document.getElementById('contact-form'); // Specific selector for the contact form
    const animatedElements = document.querySelectorAll('.animate-on-scroll'); // Elements to animate on scroll

    // --- State Variables ---
    const headerHeight = header ? header.offsetHeight : 70; // Get header height, provide default if header missing

    // --- Scroll Handling Function ---
    function handleScroll() {
        // Sticky Header Logic
        if (header) {
            if (window.scrollY > headerHeight) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Back to Top Button Visibility
        if (backToTopButton) {
            if (window.scrollY > 300) { // Show after scrolling down 300px
                 backToTopButton.classList.add('visible');
            } else {
                 backToTopButton.classList.remove('visible');
            }
        }

        // Active Navigation Link Highlighting
        let currentSectionId = '';
        sections.forEach(section => {
            // Calculate section boundaries considering the fixed header height
            // Adjust the offset (-100) as needed for better accuracy
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                 currentSectionId = section.getAttribute('id');
             }
        });

        // Handle case where user scrolls past the last section but not quite to the bottom
         if (currentSectionId === '' && window.scrollY >= (document.documentElement.scrollHeight - window.innerHeight - headerHeight - 100)) {
            const lastSection = sections[sections.length - 1];
             if(lastSection) {
                 currentSectionId = lastSection.getAttribute('id');
            }
         }


        // Update 'active' class on nav links
        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the link's href matches the current section ID (removing the '#')
            if (link.getAttribute('href') && link.getAttribute('href').slice(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
    }

    // Attach scroll listener
    window.addEventListener('scroll', handleScroll);
    // Run once on load to set initial states
    handleScroll();

    // --- Hamburger Menu Toggle ---
    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                if (navLinksContainer.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times'); // Change to 'X' icon
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars'); // Change back to 'bars' icon
                }
            }
        });
    }

    // --- Close Mobile Menu When a Link is Clicked ---
    if (navLinksContainer) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinksContainer.classList.contains('active')) {
                    navLinksContainer.classList.remove('active');
                    // Reset hamburger icon if it exists
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
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // When element enters viewport
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once the animation is triggered
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
            // rootMargin: '0px 0px -50px 0px' // Optional: Adjust when the trigger happens (e.g., 50px before it enters)
        });

        // Observe each element marked for animation
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for older browsers or if no elements to animate: show them immediately
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }

    // --- AJAX Form Submission for Contact Form ---
    if (contactForm) {
        // Check if a status message element already exists, if not create one.
        let statusMessage = contactForm.parentNode.querySelector('.form-status-message');
        if (!statusMessage) {
            statusMessage = document.createElement('p');
            statusMessage.className = 'form-status-message'; // Add a class for potential styling
            statusMessage.style.textAlign = 'center';
            statusMessage.style.marginTop = '1rem';
            statusMessage.style.minHeight = '1.2em'; // Prevent layout shift
            contactForm.parentNode.insertBefore(statusMessage, contactForm.nextSibling); // Insert message area after the form
        }
        statusMessage.textContent = ''; // Ensure it's initially empty

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default browser submission

            const form = e.target;
            const data = new FormData(form);

            // Display sending message
            statusMessage.textContent = 'Sending...';
            statusMessage.style.color = '#555'; // Neutral color

            fetch(form.action, { // Post data to the URL specified in the form's 'action' attribute
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json' // Tell Formspree we expect a JSON response
                }
            }).then(response => {
                if (response.ok) {
                    // Success
                    statusMessage.textContent = "Message sent successfully! Thank you.";
                    statusMessage.style.color = 'green';
                    form.reset(); // Clear the form fields
                } else {
                    // Handle HTTP errors (like 4xx, 5xx)
                    response.json().then(data => { // Try to parse error details from Formspree
                        if (Object.hasOwn(data, 'errors')) {
                            // Display specific Formspree errors
                            statusMessage.textContent = data["errors"].map(error => error["message"]).join(", ");
                        } else {
                            // Generic error message if parsing fails or no specific errors given
                            statusMessage.textContent = "Oops! There was a problem submitting the form. Please check your input or try again later.";
                        }
                        statusMessage.style.color = 'red';
                    }).catch(() => {
                        // Fallback if response is not JSON or another error occurs during parsing
                         statusMessage.textContent = "Oops! An unexpected error occurred. Please try again later.";
                         statusMessage.style.color = 'red';
                    });
                }
            }).catch(error => {
                // Handle network errors (fetch promise rejected)
                console.error("Form submission error:", error); // Log error for debugging
                statusMessage.textContent = "Oops! There seems to be a network issue. Please check your connection and try again.";
                statusMessage.style.color = 'red';
            });

            // Optional: Remove the status message after a few seconds
            setTimeout(() => {
                 statusMessage.textContent = ''; // Clear the message
            }, 7000); // Remove after 7 seconds
        });
    }

}); // End of DOMContentLoaded