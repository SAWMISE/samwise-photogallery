// ========================================
// CIRCUIT CANVAS BACKGROUND
// ========================================

const circuitCanvas = document.getElementById('circuitCanvas');
const circuitCtx = circuitCanvas.getContext('2d');

// Set canvas size
function resizeCircuitCanvas() {
    circuitCanvas.width = window.innerWidth;
    circuitCanvas.height = window.innerHeight;
}

resizeCircuitCanvas();
window.addEventListener('resize', resizeCircuitCanvas);

// Circuit board generation
class CircuitNode {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.connections = [];
        this.pulsePhase = Math.random() * Math.PI * 2;
    }
}

const nodes = [];
const nodeSpacing = 150;

// Generate grid of nodes
for (let x = nodeSpacing; x < circuitCanvas.width; x += nodeSpacing) {
    for (let y = nodeSpacing; y < circuitCanvas.height; y += nodeSpacing) {
        // Add some randomness to node positions
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        nodes.push(new CircuitNode(x + offsetX, y + offsetY));
    }
}

// Connect nearby nodes
nodes.forEach(node => {
    nodes.forEach(otherNode => {
        if (node !== otherNode) {
            const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
            if (distance < nodeSpacing * 1.5 && Math.random() > 0.5) {
                node.connections.push(otherNode);
            }
        }
    });
});

// Data packets traveling along connections
class DataPacket {
    constructor(startNode, endNode) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.progress = 0;
        this.speed = 0.005 + Math.random() * 0.01;
        this.active = true;
    }

    update() {
        this.progress += this.speed;
        if (this.progress >= 1) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        const x = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
        const y = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;

        // Draw packet
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - this.progress)})`;
        ctx.fill();

        // Draw glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 * (1 - this.progress)})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }
}

const dataPackets = [];

// Spawn data packets periodically
setInterval(() => {
    if (nodes.length === 0) return;

    const randomNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (randomNode.connections.length > 0) {
        const randomConnection = randomNode.connections[Math.floor(Math.random() * randomNode.connections.length)];
        dataPackets.push(new DataPacket(randomNode, randomConnection));
    }
}, 500);

// Animation loop for circuit canvas
let circuitTime = 0;

function animateCircuit() {
    circuitCtx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    circuitCtx.fillRect(0, 0, circuitCanvas.width, circuitCanvas.height);

    circuitTime += 0.016;

    // Draw connections
    nodes.forEach(node => {
        node.connections.forEach(connectedNode => {
            const pulse = Math.sin(circuitTime * 2 + node.pulsePhase) * 0.5 + 0.5;

            circuitCtx.beginPath();
            circuitCtx.moveTo(node.x, node.y);
            circuitCtx.lineTo(connectedNode.x, connectedNode.y);
            circuitCtx.strokeStyle = `rgba(255, 255, 255, ${0.05 + pulse * 0.05})`;
            circuitCtx.lineWidth = 1;
            circuitCtx.stroke();
        });
    });

    // Draw nodes
    nodes.forEach(node => {
        const pulse = Math.sin(circuitTime * 2 + node.pulsePhase) * 0.5 + 0.5;

        // Node core
        circuitCtx.beginPath();
        circuitCtx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        circuitCtx.fillStyle = `rgba(255, 255, 255, ${0.3 + pulse * 0.2})`;
        circuitCtx.fill();

        // Node glow
        const gradient = circuitCtx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 10);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 + pulse * 0.1})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        circuitCtx.fillStyle = gradient;
        circuitCtx.beginPath();
        circuitCtx.arc(node.x, node.y, 10, 0, Math.PI * 2);
        circuitCtx.fill();
    });

    // Update and draw data packets
    dataPackets.forEach((packet, index) => {
        packet.update();
        packet.draw(circuitCtx);

        if (!packet.active) {
            dataPackets.splice(index, 1);
        }
    });

    requestAnimationFrame(animateCircuit);
}

animateCircuit();

// ========================================
// STAT COUNTER ANIMATION
// ========================================

function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');

    statValues.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target + '+';
            }
        };

        updateCounter();
    });
}

// ========================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ========================================

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats-grid')) {
                animateStats();
                observer.unobserve(entry.target);
            }
        }
    });
}, {
    threshold: 0.5
});

const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) {
    observer.observe(statsGrid);
}

// ========================================
// SMOOTH SCROLL
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// PARALLAX EFFECT ON MOUSE MOVE (DISABLED)
// ========================================

// 3D tilt and parallax mouse movement effects have been disabled for cleaner UX

// ========================================
// PROFILE IMAGE LOAD EFFECT
// ========================================

const profileImg = document.getElementById('profileImg');
if (profileImg) {
    profileImg.addEventListener('load', () => {
        profileImg.style.animation = 'imageReveal 1s ease-out forwards';
    });

    // Add reveal animation to CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes imageReveal {
            0% {
                opacity: 0;
                filter: grayscale(100%) blur(10px);
                transform: scale(0.8);
            }
            100% {
                opacity: 1;
                filter: grayscale(20%) blur(0);
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}

// ========================================
// TYPING EFFECT FOR BIO PARAGRAPHS
// ========================================

function typeWriter(element, text, speed = 30) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Observe bio paragraphs and trigger typing effect
const bioObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const lineContent = entry.target.querySelector('.line-content');
            if (lineContent && !lineContent.dataset.typed) {
                lineContent.dataset.typed = 'true';
                const originalText = lineContent.textContent.trim();
                // Don't actually type - too slow, just reveal
                // typeWriter(lineContent, originalText, 10);
            }
        }
    });
}, {
    threshold: 0.3
});

document.querySelectorAll('.bio-paragraph').forEach(paragraph => {
    bioObserver.observe(paragraph);
});

// ========================================
// NAVIGATION LINK HOVER EFFECTS
// ========================================

const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        // Create particle effect
        createLinkParticles(link);
    });
});

function createLinkParticles(element) {
    const rect = element.getBoundingClientRect();
    const particles = 5;

    for (let i = 0; i < particles; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(255, 255, 255, 0.6)';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.4)';

        document.body.appendChild(particle);

        const angle = (Math.PI * 2 * i) / particles;
        const velocity = 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;

        let x = 0;
        let y = 0;
        let opacity = 1;

        function animateParticle() {
            x += vx;
            y += vy;
            opacity -= 0.02;

            particle.style.transform = `translate(${x}px, ${y}px)`;
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                particle.remove();
            }
        }

        animateParticle();
    }
}

// ========================================
// PAGE LOAD ANIMATION
// ========================================

window.addEventListener('load', () => {
    // Fade in navigation
    const nav = document.querySelector('.about-nav');
    if (nav) {
        nav.style.opacity = '0';
        nav.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            nav.style.transition = 'all 0.8s ease';
            nav.style.opacity = '1';
            nav.style.transform = 'translateY(0)';
        }, 100);
    }

    // Add loaded class to body
    document.body.classList.add('loaded');
});

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Reduce animations on mobile for better performance
if (window.innerWidth < 768) {
    // Disable some heavy animations on mobile
    const heavyAnimations = document.querySelectorAll('.cpu-core, .data-particle');
    heavyAnimations.forEach(element => {
        if (Math.random() > 0.5) {
            element.style.display = 'none';
        }
    });
}

// Pause animations when page is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations
        document.body.style.animationPlayState = 'paused';
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        // Resume animations
        document.body.style.animationPlayState = 'running';
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// ========================================
// CONSOLE EASTER EGG
// ========================================

console.log('%c SAMWISE PHOTOGRAPHY ', 'background: #0a0a0a; color: #fff; font-size: 20px; padding: 10px; font-family: monospace;');
console.log('%c SYSTEM.INITIALIZED ', 'background: #1a1a1a; color: #fff; font-size: 14px; padding: 5px; font-family: monospace;');
console.log('%c > Neural interface: CONNECTED ', 'color: #28c940; font-size: 12px; font-family: monospace;');
console.log('%c > Hardware status: OPTIMAL ', 'color: #28c940; font-size: 12px; font-family: monospace;');
console.log('%c > Visual processors: ONLINE ', 'color: #28c940; font-size: 12px; font-family: monospace;');
console.log('%c', 'font-size: 1px; padding: 50px 100px; background: url("images/SamwiseVEGAS.jpg") no-repeat center; background-size: contain;');
