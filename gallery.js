// ========================================
// GALLERY BACKGROUND ANIMATION
// ========================================

class GalleryBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.particles = [];
        this.particleCount = 80;
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.initializeParticles();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initializeParticles();
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                baseX: Math.random() * this.canvas.width,
                baseY: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.5 + Math.random() * 1.5
            });
        }
    }

    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    drawParticles() {
        this.particles.forEach(particle => {
            // Update position with subtle drift
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Wrap around screen
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Pulse effect
            const pulse = Math.sin(this.time * particle.pulseSpeed + particle.pulseOffset);
            const size = particle.size + pulse * 1;
            const opacity = 0.3 + pulse * 0.2;

            // Mouse interaction
            const dx = this.mouseX - particle.x;
            const dy = this.mouseY - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = Math.max(0, 1 - dist / 200);

            // Draw glow
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, size * 5
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${(opacity + mouseInfluence * 0.3) * 0.6})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${(opacity + mouseInfluence * 0.2) * 0.3})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size * 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw core
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity + mouseInfluence * 0.4})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw connection lines between nearby particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.15;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.time += 0.01;

        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawParticles();

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// MATRIX RAIN ANIMATION
// ========================================

class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.fontSize = 14;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];
        this.allChars = 'SAMWISE';
        this.frameCount = 0;
        this.frameSkip = 3; // Update every 3 frames for slower animation

        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }

        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);

        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const char = this.allChars[Math.floor(Math.random() * this.allChars.length)];
            const y = this.drops[i] * this.fontSize;

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fillText(char, i * this.fontSize, y);

            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fillText(char, i * this.fontSize, y);
            this.ctx.shadowBlur = 0;

            for (let j = 1; j < 6; j++) {
                const trailY = y - (j * this.fontSize);
                const trailChar = this.allChars[Math.floor(Math.random() * this.allChars.length)];
                const opacity = 0.6 - (j * 0.1);

                this.ctx.fillStyle = `rgba(200, 255, 200, ${opacity})`;
                this.ctx.fillText(trailChar, i * this.fontSize, trailY);
            }

            // Only update drops position every frameSkip frames
            if (this.frameCount % this.frameSkip === 0) {
                this.drops[i]++;
            }

            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
        }
    }

    animate() {
        this.frameCount++;
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// IMAGE DATA
// ========================================

const imageData = [
    {
        path: 'images/IMG_5039.jpg',
        description: `[ACCESSING FILE...]

Identity embedded in silicon. Paper meets circuit board - a signature written in the physical realm that houses the code.

[ANALYSIS COMPLETE]`
    },
    {
        path: 'images/SAMWISE_MirrorWCU.jpg',
        description: `[ACCESSING FILE...]

Mirror reflection captured at WCU. Self-awareness through digital eyes - the camera becomes both observer and observed.

[ANALYSIS COMPLETE]`
    },
    {
        path: 'images/SamShoe.jpg',
        description: `[ACCESSING FILE...]

Footwear documentation. Material evidence of physical presence - the interface between human mobility and terrestrial surface.

[ANALYSIS COMPLETE]`
    },
    {
        path: 'images/Ice.jpg',
        description: `[ACCESSING FILE...]

Frozen crystalline structure etched with identity - preserved in ephemeral form.

[ANALYSIS COMPLETE]`
    },
    {
        path: 'images/SamwiseVEGAS.jpg',
        description: `[ACCESSING FILE...]

Between screens and stillness - the art of creation in progress.

[ANALYSIS COMPLETE]`
    }
];

// ========================================
// GALLERY IMAGE LOADER
// ========================================

class GalleryLoader {
    constructor() {
        this.galleryGrid = document.getElementById('galleryGrid');
        this.images = imageData.map(img => img.path);
        this.currentIndex = 0;

        this.loadImages();
    }

    async loadImages() {
        // In a real implementation, this would fetch images from a directory
        // For now, we'll use the single image we know exists

        this.images.forEach((imagePath, index) => {
            const item = this.createGalleryItem(imagePath, index);
            this.galleryGrid.appendChild(item);
        });

        // Trigger fade-in animations with staggered delay
        const items = document.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    createGalleryItem(imagePath, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;

        item.innerHTML = `
            <div class="item-wrapper">
                <div class="item-frame">
                    <img src="${imagePath}" alt="Gallery Image ${index + 1}" class="item-image">
                    <div class="item-scan"></div>
                    <div class="item-glow"></div>
                    <div class="item-data-flow">
                        <div class="data-line data-line-top"></div>
                        <div class="data-line data-line-bottom"></div>
                        <div class="data-line data-line-left"></div>
                        <div class="data-line data-line-right"></div>
                    </div>
                </div>
            </div>
        `;

        item.addEventListener('click', () => {
            imageViewer.openViewer(index);
        });

        return item;
    }
}

// ========================================
// IMAGE VIEWER
// ========================================

class ImageViewer {
    constructor() {
        this.viewer = document.getElementById('imageViewer');
        this.viewerImage = document.getElementById('viewerImage');
        this.viewerCounter = document.getElementById('viewerCounter');
        this.descriptionText = document.getElementById('descriptionText');
        this.typingCursor = document.querySelector('.typing-cursor');
        this.statusText = document.querySelector('.status-text');
        this.closeBtn = document.getElementById('viewerClose');
        this.prevBtn = document.getElementById('viewerPrev');
        this.nextBtn = document.getElementById('viewerNext');

        this.images = imageData;
        this.currentIndex = 0;
        this.typewriterInterval = null;
        this.isTyping = false;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.closeBtn.addEventListener('click', () => this.closeViewer());
        this.prevBtn.addEventListener('click', () => this.showPrevious());
        this.nextBtn.addEventListener('click', () => this.showNext());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.viewer.classList.contains('active')) return;

            if (e.key === 'Escape') this.closeViewer();
            if (e.key === 'ArrowLeft') this.showPrevious();
            if (e.key === 'ArrowRight') this.showNext();
        });

        // Close on overlay click
        this.viewer.addEventListener('click', (e) => {
            if (e.target === this.viewer || e.target.classList.contains('viewer-overlay')) {
                this.closeViewer();
            }
        });
    }

    openViewer(index) {
        this.currentIndex = index;
        this.updateViewer();
        this.viewer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeViewer() {
        this.stopTypewriter();
        this.viewer.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    showPrevious() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateViewer();
    }

    showNext() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateViewer();
    }

    updateViewer() {
        const currentImage = this.images[this.currentIndex];
        this.viewerImage.src = currentImage.path;
        this.viewerCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;

        // Reset and start typewriter effect for description
        this.stopTypewriter();
        this.descriptionText.textContent = '';

        // Reset status
        if (this.statusText) {
            this.statusText.textContent = 'DECRYPTING';
        }

        // Start typewriter after a short delay
        setTimeout(() => {
            this.startTypewriter(currentImage.description);
        }, 600);
    }

    startTypewriter(text) {
        this.stopTypewriter();
        this.isTyping = true;

        if (this.typingCursor) {
            this.typingCursor.classList.remove('hidden');
        }

        let charIndex = 0;
        const speed = 15; // milliseconds per character

        this.typewriterInterval = setInterval(() => {
            if (charIndex < text.length) {
                this.descriptionText.textContent += text[charIndex];
                charIndex++;

                // Auto-scroll to bottom of description
                const descriptionContent = this.descriptionText.closest('.description-content');
                if (descriptionContent) {
                    descriptionContent.scrollTop = descriptionContent.scrollHeight;
                }
            } else {
                // Typing complete
                this.stopTypewriter();
                if (this.typingCursor) {
                    this.typingCursor.classList.add('hidden');
                }
                if (this.statusText) {
                    this.statusText.textContent = 'COMPLETE';
                }
            }
        }, speed);
    }

    stopTypewriter() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        this.isTyping = false;
    }
}

// ========================================
// TERMINAL SYSTEM
// ========================================

class TerminalSystem {
    constructor() {
        this.terminalContainer = document.getElementById('terminalContainer');
        this.terminalInput = document.getElementById('terminalInput');
        this.terminalOutput = document.getElementById('terminalOutput');
        this.closeButton = document.getElementById('closeTerminal');
        this.accessButton = document.getElementById('terminalAccessBtn');
        this.matrixAnimation = null;
        this.isActive = false;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.accessButton) {
            this.accessButton.addEventListener('click', () => this.activateTerminal());
        }

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.deactivateTerminal());
        }

        if (this.terminalInput) {
            this.terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleCommand(this.terminalInput.value);
                    this.terminalInput.value = '';
                }
            });
        }

        // ESC key to close terminal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.deactivateTerminal();
            }
        });
    }

    activateTerminal() {
        if (this.isActive) return;

        this.isActive = true;
        this.terminalContainer.classList.add('active');

        if (!this.matrixAnimation) {
            this.matrixAnimation = new MatrixRain('matrixCanvas');
        }

        setTimeout(() => {
            if (this.terminalInput) {
                this.terminalInput.focus();
            }
        }, 800);
    }

    deactivateTerminal() {
        if (!this.isActive) return;

        this.isActive = false;
        this.terminalContainer.classList.remove('active');
    }

    handleCommand(command) {
        const cmd = command.trim().toLowerCase();

        this.addTerminalLine(`$ ${command}`, 'user-input');

        if (cmd === '') {
            return;
        } else if (cmd === 'help') {
            this.showHelp();
        } else if (cmd === 'exit' || cmd === 'quit' || cmd === 'close') {
            this.addTerminalLine('Closing terminal...', 'system');
            setTimeout(() => this.deactivateTerminal(), 800);
        } else if (cmd === 'home' || cmd === 'back') {
            this.addTerminalLine('Returning to home page...', 'system');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        } else if (cmd === 'clear' || cmd === 'cls') {
            this.clearTerminal();
        } else if (cmd === 'about') {
            this.navigateToAbout();
        } else if (cmd.startsWith('echo ')) {
            const text = command.substring(5);
            this.addTerminalLine(text, 'echo');
        } else if (cmd === 'time' || cmd === 'date') {
            this.showTime();
        } else if (cmd === 'status') {
            this.showStatus();
        } else {
            this.addTerminalLine(`Command not found: ${command}. Type 'help' for available commands.`, 'error');
        }

        this.scrollToBottom();
    }

    addTerminalLine(text, type = 'normal') {
        const line = document.createElement('div');
        line.className = 'terminal-line';

        if (type === 'user-input') {
            line.innerHTML = `<span class="terminal-prompt">$</span> <span class="terminal-text">${text.substring(2)}</span>`;
        } else if (type === 'error') {
            line.innerHTML = `<span class="terminal-prompt">&gt;</span> <span class="terminal-text" style="color: rgba(255, 95, 87, 0.9);">${text}</span>`;
        } else if (type === 'system') {
            line.innerHTML = `<span class="terminal-prompt">&gt;</span> <span class="terminal-text" style="color: rgba(40, 201, 64, 0.9);">${text}</span>`;
        } else if (type === 'echo') {
            line.innerHTML = `<span class="terminal-text">${text}</span>`;
        } else {
            line.innerHTML = `<span class="terminal-prompt">&gt;</span> <span class="terminal-text">${text}</span>`;
        }

        this.terminalOutput.appendChild(line);
    }

    showHelp() {
        const commands = [
            '',
            'Available Commands:',
            '─────────────────────────────',
            'help      - Show this help message',
            'status    - Show system status',
            'time      - Display current time',
            'echo      - Echo a message',
            'clear     - Clear terminal screen',
            '',
            'Website Navigation:',
            '─────────────────────────────',
            'home      - Return to home page',
            'about     - View author bio page',
            'gallery   - Enter the holographic gallery',
            'exit      - Close terminal',
            '─────────────────────────────',
            ''
        ];

        commands.forEach(cmd => this.addTerminalLine(cmd, 'normal'));
    }

    navigateToAbout() {
        this.addTerminalLine('Accessing author data...', 'system');
        this.addTerminalLine('Loading bio interface...', 'system');

        // Create smooth transition effect
        setTimeout(() => {
            this.addTerminalLine('TRANSFER INITIATED', 'system');

            // Smooth fade out
            const terminalContainer = document.querySelector('.terminal-container');
            if (terminalContainer) {
                terminalContainer.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                terminalContainer.style.opacity = '0';
            }

            setTimeout(() => {
                window.location.href = 'about.html';
            }, 600);
        }, 600);
    }

    showTime() {
        const now = new Date();
        const timeString = now.toLocaleString();
        this.addTerminalLine(`Current time: ${timeString}`, 'system');
    }

    showStatus() {
        const status = [
            '',
            'Gallery Status:',
            '─────────────────────────────',
            'Status: ONLINE',
            'Display Mode: HOLOGRAPHIC',
            'Image Processing: ACTIVE',
            'Neural Interface: CONNECTED',
            'Render Quality: MAXIMUM',
            '─────────────────────────────',
            ''
        ];

        status.forEach(line => this.addTerminalLine(line, 'system'));
    }

    clearTerminal() {
        this.terminalOutput.innerHTML = '';
    }

    scrollToBottom() {
        this.terminalOutput.scrollTop = this.terminalOutput.scrollHeight;
    }
}

// ========================================
// PARTICLE SYSTEM
// ========================================

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particleSystem');
        if (!this.container) return;

        this.particleCount = 20;
        this.createParticles();
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${10 + Math.random() * 10}s`;

            this.container.appendChild(particle);
        }
    }
}

// ========================================
// NAVIGATION
// ========================================

class Navigation {
    constructor() {
        this.homeButton = document.getElementById('homeButton');

        if (this.homeButton) {
            this.homeButton.addEventListener('click', () => {
                this.navigateHome();
            });
        }
    }

    navigateHome() {
        // Create smooth transition effect
        const overlay = document.getElementById('transitionOverlay');
        overlay.classList.remove('hidden');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 600);
    }
}

// ========================================
// PAGE TRANSITION
// ========================================

class PageTransition {
    constructor() {
        this.overlay = document.getElementById('transitionOverlay');
        this.hideTransition();
    }

    hideTransition() {
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.classList.add('hidden');
            }
        }, 400);
    }
}

// ========================================
// INITIALIZE ALL SYSTEMS
// ========================================

let galleryBackground;
let galleryLoader;
let imageViewer;
let terminalSystem;
let particleSystem;
let navigation;
let pageTransition;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize page transition
    pageTransition = new PageTransition();

    // Initialize background
    galleryBackground = new GalleryBackground('galleryCanvas');

    // Initialize gallery loader
    galleryLoader = new GalleryLoader();

    // Initialize image viewer
    imageViewer = new ImageViewer();

    // Initialize terminal system
    terminalSystem = new TerminalSystem();

    // Initialize particle system
    particleSystem = new ParticleSystem();

    // Initialize navigation
    navigation = new Navigation();

    console.log('Gallery initialized successfully');
});
