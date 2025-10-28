// ========================================
// ANIMATED GRID CANVAS
// ========================================

class AnimatedGrid {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Grid configuration
        this.gridSize = 60;
        this.lines = [];
        this.nodes = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.time = 0;

        // Initialize grid elements
        this.initializeLines();
        this.initializeNodes();

        // Event listeners
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));

        // Start animation
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.initializeLines();
        this.initializeNodes();
    }

    initializeLines() {
        this.lines = [];
        const cols = Math.ceil(this.canvas.width / this.gridSize) + 1;
        const rows = Math.ceil(this.canvas.height / this.gridSize) + 1;

        // Vertical lines
        for (let i = 0; i < cols; i++) {
            this.lines.push({
                x1: i * this.gridSize,
                y1: 0,
                x2: i * this.gridSize,
                y2: this.canvas.height,
                type: 'vertical',
                offset: Math.random() * Math.PI * 2,
                speed: 0.2 + Math.random() * 0.3
            });
        }

        // Horizontal lines
        for (let i = 0; i < rows; i++) {
            this.lines.push({
                x1: 0,
                y1: i * this.gridSize,
                x2: this.canvas.width,
                y2: i * this.gridSize,
                type: 'horizontal',
                offset: Math.random() * Math.PI * 2,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }

    initializeNodes() {
        this.nodes = [];
        const cols = Math.ceil(this.canvas.width / this.gridSize) + 1;
        const rows = Math.ceil(this.canvas.height / this.gridSize) + 1;

        // Calculate center of screen and radar radius
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        // Radar radius is 250px (or 150px on mobile), add small buffer for smooth edge
        const radarRadius = window.innerWidth <= 768 ? 150 : 250;
        const exclusionRadius = radarRadius + 20; // Add buffer for smoother edge

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const nodeX = i * this.gridSize;
                const nodeY = j * this.gridSize;

                // Calculate distance from center
                const dx = nodeX - centerX;
                const dy = nodeY - centerY;
                const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

                // Only create nodes at certain intersections (sparse grid)
                // AND outside the radar circle radius
                if (Math.random() > 0.7 && distanceFromCenter > exclusionRadius) {
                    this.nodes.push({
                        x: nodeX,
                        y: nodeY,
                        baseX: nodeX,
                        baseY: nodeY,
                        pulseOffset: Math.random() * Math.PI * 2,
                        pulseSpeed: 1 + Math.random() * 2
                    });
                }
            }
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    drawLines() {
        this.lines.forEach(line => {
            // Calculate pulsing opacity
            const pulseValue = Math.sin(this.time * line.speed + line.offset);
            const baseOpacity = 0.02;
            const opacity = baseOpacity + pulseValue * 0.01;

            // Calculate distance from mouse for interactive effect
            let mouseInfluence = 0;
            if (line.type === 'vertical') {
                const dist = Math.abs(this.mouseX - line.x1);
                mouseInfluence = Math.max(0, 1 - dist / 280) * 0.09;
            } else {
                const dist = Math.abs(this.mouseY - line.y1);
                mouseInfluence = Math.max(0, 1 - dist / 280) * 0.09;
            }

            // Draw line with gradient for depth
            const gradient = line.type === 'vertical'
                ? this.ctx.createLinearGradient(line.x1, line.y1, line.x1, line.y2)
                : this.ctx.createLinearGradient(line.x1, line.y1, line.x2, line.y1);

            gradient.addColorStop(0, `rgba(255, 255, 255, ${(opacity + mouseInfluence) * 0.5})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity + mouseInfluence})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${(opacity + mouseInfluence) * 0.5})`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1 + (mouseInfluence * 1.5);
            this.ctx.beginPath();
            this.ctx.moveTo(line.x1, line.y1);
            this.ctx.lineTo(line.x2, line.y2);
            this.ctx.stroke();
        });
    }

    drawNodes() {
        this.nodes.forEach(node => {
            // Calculate pulsing effect
            const pulse = Math.sin(this.time * node.pulseSpeed + node.pulseOffset);
            const size = 2 + pulse * 1;
            const opacity = 0.08 + pulse * 0.05;

            // Calculate distance from mouse
            const dx = this.mouseX - node.x;
            const dy = this.mouseY - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = Math.max(0, 1 - dist / 220);

            // Subtle movement based on mouse position
            const offsetX = mouseInfluence * dx * 0.08;
            const offsetY = mouseInfluence * dy * 0.08;

            // Draw node with glow
            const finalOpacity = opacity + mouseInfluence * 0.18;

            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                node.x + offsetX, node.y + offsetY, 0,
                node.x + offsetX, node.y + offsetY, size * 5
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${finalOpacity * 0.7})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${finalOpacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(node.x + offsetX, node.y + offsetY, size * 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Core node
            this.ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x + offsetX, node.y + offsetY, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawAccentLines() {
        // Draw occasional accent lines that pulse across the grid
        const accentLinePosition = (Math.sin(this.time * 0.3) + 1) / 2;
        const y = this.canvas.height * accentLinePosition;

        const gradient = this.ctx.createLinearGradient(0, y, this.canvas.width, y);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }

    animate() {
        this.time += 0.005;

        // Clear canvas with slight trail effect for smoothness
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Set up clipping path to exclude radar circle area
        this.ctx.save();

        // Calculate center and radar radius
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radarRadius = window.innerWidth <= 768 ? 150 : 250;
        const exclusionRadius = radarRadius + 20; // Add buffer for smooth edge

        // Create clipping region: full canvas minus the radar circle
        this.ctx.beginPath();
        this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.arc(centerX, centerY, exclusionRadius, 0, Math.PI * 2, true); // true = counterclockwise for hole
        this.ctx.clip();

        // Draw all elements (will be clipped outside radar circle)
        this.drawLines();
        this.drawAccentLines();

        this.ctx.restore();

        // Draw nodes (already have their own exclusion logic)
        this.drawNodes();

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// RADAR SCANNER SYSTEM
// ========================================

class RadarScanner {
    constructor() {
        this.blipContainer = document.querySelector('.radar-blips');
        if (!this.blipContainer) return;

        this.blips = [];
        this.maxBlips = 0; // Disabled - no blips
        this.radarRadius = 250; // Half of radar container width
        this.time = 0;

        // Blips disabled - not initializing
        // this.initializeBlips();

        // Animation loop disabled - no blips to animate
        // this.animate();

        // Detection effects disabled
        // setInterval(() => this.triggerDetection(), 6000);
    }

    initializeBlips() {
        // Create initial blips at random positions
        for (let i = 0; i < this.maxBlips; i++) {
            this.createBlip();
        }
    }

    createBlip() {
        const blip = document.createElement('div');
        blip.className = 'radar-blip';

        // Random position within radar circle
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * (this.radarRadius - 30) + 20; // Keep away from edges

        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        blip.style.left = `${50 + (x / this.radarRadius) * 50}%`;
        blip.style.top = `${50 + (y / this.radarRadius) * 50}%`;

        // Random animation delay for variety
        blip.style.animationDelay = `${Math.random() * 2}s`;

        this.blipContainer.appendChild(blip);

        // Store blip data for potential updates
        this.blips.push({
            element: blip,
            x: x,
            y: y,
            angle: angle,
            distance: distance,
            speed: 0.15 + Math.random() * 0.25
        });

        // Remove old blips if too many
        if (this.blips.length > this.maxBlips) {
            const oldBlip = this.blips.shift();
            if (oldBlip.element.parentNode) {
                oldBlip.element.remove();
            }
        }
    }

    triggerDetection() {
        // Randomly select a blip to "detect"
        if (this.blips.length === 0) return;

        const randomBlip = this.blips[Math.floor(Math.random() * this.blips.length)];
        randomBlip.element.classList.add('detected');

        // Create particle burst effect
        this.createParticleBurst(randomBlip.x, randomBlip.y);

        // Remove detected class after animation
        setTimeout(() => {
            randomBlip.element.classList.remove('detected');
        }, 1000);
    }

    createParticleBurst(x, y) {
        const particleCount = 8;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '3px';
            particle.style.height = '3px';
            particle.style.background = 'rgba(255, 255, 255, 0.8)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.left = `${50 + (x / this.radarRadius) * 50}%`;
            particle.style.top = `${50 + (y / this.radarRadius) * 50}%`;
            particle.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.8)';

            this.blipContainer.appendChild(particle);

            // Animate particle outward
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 30;
            const endX = x + Math.cos(angle) * distance;
            const endY = y + Math.sin(angle) * distance;

            const animation = particle.animate([
                {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1
                },
                {
                    left: `${50 + (endX / this.radarRadius) * 50}%`,
                    top: `${50 + (endY / this.radarRadius) * 50}%`,
                    transform: 'translate(-50%, -50%) scale(0)',
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'ease-out'
            });

            animation.onfinish = () => particle.remove();
        }
    }

    animate() {
        this.time += 0.0025;

        // Subtle movement of blips (slow drift)
        this.blips.forEach(blipData => {
            const drift = Math.sin(this.time * blipData.speed) * 2;
            const newAngle = blipData.angle + drift * 0.01;

            const x = Math.cos(newAngle) * blipData.distance;
            const y = Math.sin(newAngle) * blipData.distance;

            blipData.element.style.left = `${50 + (x / this.radarRadius) * 50}%`;
            blipData.element.style.top = `${50 + (y / this.radarRadius) * 50}%`;
        });

        // Occasionally add new blips to create dynamic feel
        if (Math.random() < 0.01 && this.blips.length < this.maxBlips) {
            this.createBlip();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// NEURAL WEB CONNECTIONS
// ========================================

class NeuralWebConnections {
    constructor() {
        this.svg = document.querySelector('.connection-layer');
        if (!this.svg) return;

        this.nodes = this.getNodePositions();
        this.connections = [];
        this.time = 0;

        // Create connection lines between nearby nodes
        this.createConnections();

        // Animate connections
        this.animate();

        // Update on resize
        window.addEventListener('resize', () => {
            this.nodes = this.getNodePositions();
            this.updateConnections();
        });
    }

    getNodePositions() {
        const webNodes = document.querySelectorAll('.web-node');
        const nodes = [];

        webNodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            const svgRect = this.svg.getBoundingClientRect();

            nodes.push({
                x: rect.left + rect.width / 2 - svgRect.left,
                y: rect.top + rect.height / 2 - svgRect.top,
                element: node,
                isPrimary: !node.classList.contains('web-node-secondary') && !node.classList.contains('web-node-micro'),
                isSecondary: node.classList.contains('web-node-secondary'),
                isMicro: node.classList.contains('web-node-micro')
            });
        });

        return nodes;
    }

    createConnections() {
        // Clear existing connections
        while (this.svg.firstChild && this.svg.firstChild.nodeName !== 'defs') {
            if (this.svg.firstChild.nodeName !== 'defs') {
                this.svg.removeChild(this.svg.firstChild);
            } else {
                break;
            }
        }

        this.connections = [];

        // Connect primary nodes to nearby nodes
        this.nodes.forEach((node, i) => {
            this.nodes.forEach((otherNode, j) => {
                if (i >= j) return; // Avoid duplicate connections

                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Connection thresholds based on node types
                let maxDistance = 0;

                if (node.isPrimary && otherNode.isPrimary) {
                    maxDistance = 400; // Primary to primary: longer connections
                } else if ((node.isPrimary && otherNode.isSecondary) || (node.isSecondary && otherNode.isPrimary)) {
                    maxDistance = 300; // Primary to secondary: medium connections
                } else if (node.isSecondary && otherNode.isSecondary) {
                    maxDistance = 250; // Secondary to secondary: shorter connections
                } else if (node.isMicro || otherNode.isMicro) {
                    maxDistance = 180; // Micro nodes: short range only
                }

                if (distance < maxDistance) {
                    this.createConnectionLine(node, otherNode, distance, maxDistance);
                }
            });
        });
    }

    createConnectionLine(node1, node2, distance, maxDistance) {
        // Create SVG line element
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        // Calculate opacity based on distance (closer = more visible)
        const baseOpacity = 1 - (distance / maxDistance);
        const opacity = baseOpacity * 0.25; // Scale down for subtlety

        // Set line properties
        line.setAttribute('x1', node1.x);
        line.setAttribute('y1', node1.y);
        line.setAttribute('x2', node2.x);
        line.setAttribute('y2', node2.y);
        line.setAttribute('stroke', 'rgba(255, 255, 255, ' + opacity + ')');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('filter', 'url(#glow)');

        // Add subtle animation offset
        const animationOffset = Math.random() * Math.PI * 2;

        this.svg.appendChild(line);

        this.connections.push({
            line: line,
            node1: node1,
            node2: node2,
            baseOpacity: opacity,
            animationOffset: animationOffset,
            distance: distance
        });
    }

    updateConnections() {
        // Recreate connections with new positions
        this.createConnections();
    }

    animate() {
        this.time += 0.01;

        // Animate connection opacity with smooth wave effect
        this.connections.forEach(conn => {
            const wave = Math.sin(this.time + conn.animationOffset);
            const pulseOpacity = conn.baseOpacity + (wave * conn.baseOpacity * 0.3);

            // Keep opacity smooth and consistent
            const finalOpacity = Math.min(pulseOpacity, 0.5);
            conn.line.setAttribute('stroke', `rgba(255, 255, 255, ${finalOpacity})`);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize grid when DOM is loaded
// (Combined with terminal initialization at the end of file)

// ========================================
// SMOOTH SCROLLING
// ========================================

// Smooth scrolling for navigation links
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

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Modal functions
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    modal.style.display = 'flex';
    modalImage.src = imageSrc;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal on click outside image
const imageModal = document.getElementById('imageModal');
if (imageModal) {
    imageModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('imageModal');
        if (modal && modal.style.display === 'flex') {
            closeModal();
        }
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe gallery items
// (Combined with initialization at the end of file)

// ========================================
// TERMINAL SYSTEM
// ========================================

class TerminalSystem {
    constructor() {
        this.heroSection = document.querySelector('.hero');
        this.navigateButton = document.querySelector('.navigate-button');
        this.terminalContainer = document.getElementById('terminalContainer');
        this.terminalInput = document.getElementById('terminalInput');
        this.terminalOutput = document.getElementById('terminalOutput');
        this.closeButton = document.getElementById('closeTerminal');
        this.matrixAnimation = null;
        this.isActive = false;
        this.maxLines = 500; // Limit DOM elements for performance
        this.isScrolling = false;
        this.scrollTimeout = null;

        this.initializeEventListeners();
        this.initializeScrollOptimization();
    }

    initializeScrollOptimization() {
        // Pause Matrix animation during scrolling for better performance
        if (this.terminalOutput) {
            this.terminalOutput.addEventListener('scroll', () => {
                this.isScrolling = true;

                // Reduce Matrix animation frame rate during scroll
                if (this.matrixAnimation) {
                    this.matrixAnimation.reduceFrameRate();
                }

                // Clear previous timeout
                clearTimeout(this.scrollTimeout);

                // Set timeout to detect when scrolling stops
                this.scrollTimeout = setTimeout(() => {
                    this.isScrolling = false;
                    if (this.matrixAnimation) {
                        this.matrixAnimation.restoreFrameRate();
                    }
                }, 150);
            }, { passive: true });
        }
    }

    initializeEventListeners() {
        // Navigate button click
        if (this.navigateButton) {
            this.navigateButton.addEventListener('click', () => this.activateTerminal());
        }

        // Close button click
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.deactivateTerminal());
        }

        // Terminal input handling
        if (this.terminalInput) {
            this.terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleCommand(this.terminalInput.value);
                    this.terminalInput.value = '';
                }
            });
        }
    }

    activateTerminal() {
        if (this.isActive) return;

        this.isActive = true;
        this.heroSection.classList.add('terminal-active');
        this.terminalContainer.classList.add('active');

        // Start matrix animation
        if (!this.matrixAnimation) {
            this.matrixAnimation = new MatrixRain('matrixCanvas');
        }

        // Focus on terminal input after animation
        setTimeout(() => {
            if (this.terminalInput) {
                this.terminalInput.focus();
            }
        }, 800);
    }

    deactivateTerminal() {
        if (!this.isActive) return;

        this.isActive = false;
        this.heroSection.classList.remove('terminal-active');
        this.terminalContainer.classList.remove('active');
    }

    handleCommand(command) {
        const cmd = command.trim().toLowerCase();

        // Add user input to output
        this.addTerminalLine(`$ ${command}`, 'user-input');

        // Process commands
        if (cmd === '') {
            return;
        } else if (cmd === 'help') {
            this.showHelp();
        } else if (cmd === 'gallery') {
            this.navigateToGallery();
        } else if (cmd === 'exit' || cmd === 'quit' || cmd === 'home') {
            this.addTerminalLine('Returning to home...', 'system');
            setTimeout(() => this.deactivateTerminal(), 800);
        } else if (cmd === 'clear' || cmd === 'cls') {
            this.clearTerminal();
        } else if (cmd === 'about') {
            this.navigateToAbout();
        } else if (cmd === 'matrix') {
            this.addTerminalLine('You are already in the matrix...', 'system');
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

        // Auto scroll to bottom
        this.scrollToBottom();
    }

    addTerminalLine(text, type = 'normal') {
        // Performance: Use DocumentFragment for batch operations
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

        // Performance: Limit number of lines in DOM
        this.limitTerminalLines();
    }

    limitTerminalLines() {
        const lines = this.terminalOutput.children;
        if (lines.length > this.maxLines) {
            // Remove oldest lines to prevent DOM bloat
            const removeCount = lines.length - this.maxLines;
            for (let i = 0; i < removeCount; i++) {
                this.terminalOutput.removeChild(lines[0]);
            }
        }
    }

    navigateToGallery() {
        this.addTerminalLine('Initializing holographic gallery interface...', 'system');
        this.addTerminalLine('Accessing visual matrix...', 'system');

        // Create smooth transition effect
        setTimeout(() => {
            this.addTerminalLine('TRANSFER INITIATED', 'system');

            // Create smooth fade effect before transition
            const terminalScreen = document.querySelector('.terminal-screen');
            if (terminalScreen) {
                terminalScreen.style.animation = 'smoothTransitionOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            }

            // Also fade the entire terminal container
            const terminalContainer = document.querySelector('.terminal-container');
            if (terminalContainer) {
                terminalContainer.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                terminalContainer.style.opacity = '0';
            }

            setTimeout(() => {
                window.location.href = 'gallery.html';
            }, 600);
        }, 600);
    }

    navigateToAbout() {
        this.addTerminalLine('Accessing author data...', 'system');
        this.addTerminalLine('Loading bio interface...', 'system');

        // Create smooth transition effect
        setTimeout(() => {
            this.addTerminalLine('TRANSFER INITIATED', 'system');

            // Create smooth fade effect before transition
            const terminalScreen = document.querySelector('.terminal-screen');
            if (terminalScreen) {
                terminalScreen.style.animation = 'smoothTransitionOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            }

            // Also fade the entire terminal container
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
            'exit      - Return to home page',
            '─────────────────────────────',
            ''
        ];

        commands.forEach(cmd => this.addTerminalLine(cmd, 'normal'));
    }

    showTime() {
        const now = new Date();
        const timeString = now.toLocaleString();
        this.addTerminalLine(`Current time: ${timeString}`, 'system');
    }

    showStatus() {
        const status = [
            '',
            'System Status:',
            '─────────────────────────────',
            'Status: ONLINE',
            'Connection: SECURE',
            'Matrix Protocol: ACTIVE',
            'Neural Interface: CONNECTED',
            'Encryption: AES-256',
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
// MATRIX RAIN ANIMATION
// ========================================

class MatrixRain {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Matrix configuration
        this.fontSize = 14;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = [];

        // Characters to display - SAMWISE text
        this.allChars = 'SAMWISE';

        // Frame control for slower animation
        this.frameCount = 0;
        this.frameSkip = 3; // Update every 3 frames for slower animation
        this.originalFrameSkip = 3;
        this.scrollingFrameSkip = 6; // Even slower during scroll

        // Initialize drops
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }

        // Event listeners
        window.addEventListener('resize', () => this.resize());

        // Start animation
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);

        // Reinitialize drops on resize
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }

    draw() {
        // Semi-transparent black to create fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            // Random character
            const char = this.allChars[Math.floor(Math.random() * this.allChars.length)];

            // Gradient effect: brighter at the tip
            const y = this.drops[i] * this.fontSize;

            // Lead character (brightest) - reduced opacity
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fillText(char, i * this.fontSize, y);

            // Glow effect for lead character - reduced intensity
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            this.ctx.fillText(char, i * this.fontSize, y);
            this.ctx.shadowBlur = 0;

            // Trail characters (fading green) - shorter trail
            for (let j = 1; j < 6; j++) {
                const trailY = y - (j * this.fontSize);
                const trailChar = this.allChars[Math.floor(Math.random() * this.allChars.length)];
                const opacity = 0.6 - (j * 0.1);

                this.ctx.fillStyle = `rgba(200, 255, 200, ${opacity})`;
                this.ctx.fillText(trailChar, i * this.fontSize, trailY);
            }

            // Move drop down only every frameSkip frames
            if (this.frameCount % this.frameSkip === 0) {
                this.drops[i]++;
            }

            // Reset drop to top randomly
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

    // Performance optimization methods for scrolling
    reduceFrameRate() {
        this.frameSkip = this.scrollingFrameSkip;
    }

    restoreFrameRate() {
        this.frameSkip = this.originalFrameSkip;
    }
}
// Initialize all systems when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animated grid background
    new AnimatedGrid('gridCanvas');

    // Initialize neural web connections
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
        new NeuralWebConnections();
    }, 100);

    // Initialize radar scanner
    new RadarScanner();

    // Initialize terminal system
    new TerminalSystem();

    // Observe gallery items for animations
    const galleryItems = document.querySelectorAll('.photo-card');
    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });
});
