// Global variables
let scene, camera, renderer, sphere, particles, animationId;
let mouseX = 0, mouseY = 0;
let isLoaded = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    init3D();
    initNavigation();
    initLoadingScreen();
    initScrollAnimations();
    initContactForm();
    initParticles();
});

// Initialize Three.js scene
function init3D() {
    const canvas = document.getElementById('canvas3d');
    const container = canvas.parentElement;
    
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 8;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Create wireframe sphere (main object)
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6b6b,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);
    
    // Create inner glowing sphere
    const innerGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const innerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.1
    });
    const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerSphere);
    
    // Create particle system
    createParticleSystem();
    
    // Create floating geometric shapes
    createFloatingShapes();
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xff6b6b, 1, 100);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);
    
    // Mouse interaction
    document.addEventListener('mousemove', onMouseMove);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

// Create particle system
function createParticleSystem() {
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xff6b6b,
        size: 0.1,
        transparent: true,
        opacity: 0.6
    });
    
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

// Create floating geometric shapes
function createFloatingShapes() {
    const shapes = [];
    
    // Create various geometric shapes
    for (let i = 0; i < 8; i++) {
        let geometry, material, mesh;
        
        if (i % 3 === 0) {
            geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        } else if (i % 3 === 1) {
            geometry = new THREE.TetrahedronGeometry(0.3);
        } else {
            geometry = new THREE.OctahedronGeometry(0.3);
        }
        
        material = new THREE.MeshBasicMaterial({ 
            color: 0xff6b6b,
            wireframe: true,
            transparent: true,
            opacity: 0.4
        });
        
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        
        mesh.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        scene.add(mesh);
        shapes.push(mesh);
    }
    
    // Store shapes for animation
    scene.userData.shapes = shapes;
}

// Mouse move handler
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Window resize handler
function onWindowResize() {
    const container = document.getElementById('canvas3d').parentElement;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (!isLoaded) return;
    
    // Rotate main sphere
    sphere.rotation.x += 0.005;
    sphere.rotation.y += 0.01;
    
    // Rotate particle system
    particles.rotation.y += 0.002;
    
    // Animate floating shapes
    if (scene.userData.shapes) {
        scene.userData.shapes.forEach((shape, index) => {
            shape.rotation.x += 0.01 * (index % 2 === 0 ? 1 : -1);
            shape.rotation.y += 0.015 * (index % 2 === 0 ? 1 : -1);
            shape.rotation.z += 0.008 * (index % 2 === 0 ? 1 : -1);
            
            // Floating motion
            shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
        });
    }
    
    // Camera movement based on mouse
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    // Update particle positions
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    
    renderer.render(scene, camera);
}

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Smooth scroll to section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Update active nav on scroll
    window.addEventListener('scroll', updateActiveNav);
}

// Update active navigation on scroll
function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Initialize loading screen
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Simulate loading time
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        isLoaded = true;
        
        // Initialize GSAP animations after loading
        initGSAPAnimations();
    }, 2000);
}

// Initialize GSAP animations
function initGSAPAnimations() {
    // Hero text animation
    gsap.from('.hero-text h2', {
        duration: 1,
        y: 100,
        opacity: 0,
        stagger: 0.3,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-text p', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.8,
        ease: 'power3.out'
    });
    
    gsap.from('.hero-buttons .btn', {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 1.2,
        stagger: 0.2,
        ease: 'power3.out'
    });
    
    // 3D canvas animation
    gsap.from('.hero-3d', {
        duration: 1.5,
        scale: 0.8,
        opacity: 0,
        delay: 0.5,
        ease: 'power3.out'
    });
}

// Initialize scroll animations
function initScrollAnimations() {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // Animate section content
                const children = entry.target.querySelectorAll('.section-title, .about-text, .stat, .work-item, .skill-category, .contact-info, .contact-form');
                
                gsap.from(children, {
                    duration: 1,
                    y: 50,
                    opacity: 0,
                    stagger: 0.2,
                    ease: 'power3.out'
                });
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Initialize contact form
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Show success message (in a real app, you'd send to server)
            alert('Thank you for your message! I\'ll get back to you soon.');
            
            // Reset form
            this.reset();
        });
    }
}

// Initialize particles background
function initParticles() {
    // Create floating particles in background
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Create individual particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(255, 107, 107, 0.5);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${5 + Math.random() * 10}s infinite linear;
        `;
        particleContainer.appendChild(particle);
    }
    
    // Add CSS animation for particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Button click handlers
document.addEventListener('DOMContentLoaded', function() {
    const viewWorkBtn = document.querySelector('.btn-primary');
    const getInTouchBtn = document.querySelector('.btn-secondary');
    
    if (viewWorkBtn) {
        viewWorkBtn.addEventListener('click', function() {
            document.querySelector('#work').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (getInTouchBtn) {
        getInTouchBtn.addEventListener('click', function() {
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Cleanup function
function cleanup() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('scroll', updateActiveNav);
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);
