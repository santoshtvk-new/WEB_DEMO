/**
 * WebDemoer - A portable JS bundle for creating dynamic, visually appealing 
 * website walkthroughs with semi-transparent overlays and curvy arrows.
 */
class WebDemoer {
    constructor(options = {}) {
        this.steps = options.steps || [];
        this.currentStepIndex = 0;
        this.isActive = false;
        
        // Theme / styling options
        this.overlayColor = options.overlayColor || 'rgba(15, 23, 42, 0.85)'; // Deep blue-gray dark mode by default
        this.arrowColor = options.arrowColor || '#3b82f6';
        this.dialogColor = options.dialogColor || '#ffffffe6';
        this.arrowWidth = options.arrowWidth || 4;
        this.borderRadius = options.borderRadius || 8;
        this.padding = options.padding || 10;
        this.zIndex = options.zIndex || 9999999;
        this.fontFamily = options.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
        
        // Callbacks
        this.onStart = options.onStart || function() {};
        this.onNext = options.onNext || function() {};
        this.onPrev = options.onPrev || function() {};
        this.onStop = options.onStop || function() {};
        
        this.elements = {};
        
        this._handleResize = this._handleResize.bind(this);
        this._handleScroll = this._handleScroll.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
    }

    _injectStyles() {
        if (document.getElementById('web-demoer-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'web-demoer-styles';
        style.innerHTML = `
            .web-demoer-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: ${this.zIndex};
                opacity: 0;
                transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .web-demoer-container.demoer-active {
                opacity: 1;
                pointer-events: auto;
            }
            .web-demoer-svg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            .web-demoer-dialog {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.95);
                width: 320px;
                background: ${this.dialogColor};
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.1);
                padding: 24px;
                font-family: ${this.fontFamily};
                color: #1e293b;
                pointer-events: auto;
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
                opacity: 0;
            }
            .web-demoer-container.demoer-active .web-demoer-dialog {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            .web-demoer-title {
                margin: 0 0 8px 0;
                font-size: 1.25rem;
                font-weight: 700;
                color: #0f172a;
            }
            .web-demoer-content {
                margin: 0 0 24px 0;
                font-size: 0.95rem;
                line-height: 1.5;
                color: #475569;
            }
            .web-demoer-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid #f1f5f9;
                padding-top: 16px;
            }
            .web-demoer-progress {
                font-size: 0.85rem;
                color: #94a3b8;
                font-weight: 500;
            }
            .web-demoer-buttons {
                display: flex;
                gap: 8px;
            }
            .web-demoer-btn {
                appearance: none;
                border: none;
                background: transparent;
                padding: 8px 16px;
                font-size: 0.875rem;
                font-weight: 600;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .web-demoer-btn-prev {
                color: #64748b;
                background: #f1f5f9;
            }
            .web-demoer-btn-prev:hover {
                background: #e2e8f0;
                color: #334155;
            }
            .web-demoer-btn-next {
                color: #ffffff;
                background: ${this.arrowColor};
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .web-demoer-btn-next:hover {
                background: #2563eb;
                box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
                transform: translateY(-1px);
            }
            .web-demoer-btn-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: transparent;
                border: none;
                color: #94a3b8;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
            }
            .web-demoer-btn-close:hover {
                color: #475569;
                background: #f1f5f9;
            }
            
            /* Add arrow animation */
            .demo-arrow-path {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
                animation: drawArrow 1s ease-in-out forwards;
            }
            @keyframes drawArrow {
                to { stroke-dashoffset: 0; }
            }
            
            /* Target spot highlight animation */
            .demo-target-pulse {
                animation: pulseRect 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
                transform-origin: center;
            }
            @keyframes pulseRect {
                0% { opacity: 0.5; stroke-width: 2; }
                50% { opacity: 1; stroke-width: 6; }
                100% { opacity: 0.5; stroke-width: 2; }
            }
        `;
        document.head.appendChild(style);
    }

    _buildDOM() {
        if (this.elements.container) return;

        this._injectStyles();

        // Main container
        const container = document.createElement('div');
        container.className = 'web-demoer-container';

        // SVG string for the overlay, mask, and arrow
        const svgContent = `
            <svg class="web-demoer-svg" preserveAspectRatio="none">
                <defs>
                    <mask id="demoer-cutout">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        <rect id="demoer-target-hole" x="-1000" y="-1000" width="0" height="0" rx="${this.borderRadius}" fill="black" />
                    </mask>
                    <marker id="demoer-arrowhead" viewBox="0 0 10 10" refX="8" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="${this.arrowColor}" />
                    </marker>
                    <!-- Gradient for the arrow -->
                    <linearGradient id="demoer-arrow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${this.arrowColor}" />
                        <stop offset="100%" stop-color="#38bdf8" />
                    </linearGradient>
                </defs>
                
                <!-- Dim overlay -->
                <rect x="0" y="0" width="100%" height="100%" fill="${this.overlayColor}" mask="url(#demoer-cutout)" />
                
                <!-- Target bounding box indicator -->
                <rect id="demoer-target-outline" class="demo-target-pulse" x="-1000" y="-1000" width="0" height="0" rx="${this.borderRadius}" fill="none" stroke="${this.arrowColor}" stroke-opacity="0.3" stroke-width="2" />
                
                <!-- Curvy animated arrow -->
                <path id="demoer-arrow-curve" class="demo-arrow-path" d="" fill="none" stroke="url(#demoer-arrow-grad)" stroke-width="${this.arrowWidth}" stroke-linecap="round" marker-end="url(#demoer-arrowhead)" />
            </svg>
        `;
        
        container.innerHTML = svgContent;

        // Dialog card
        const dialog = document.createElement('div');
        dialog.className = 'web-demoer-dialog';
        
        dialog.innerHTML = `
            <button class="web-demoer-btn-close" aria-label="Close demo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <h3 class="web-demoer-title"></h3>
            <p class="web-demoer-content"></p>
            <div class="web-demoer-footer">
                <span class="web-demoer-progress"></span>
                <div class="web-demoer-buttons">
                    <button class="web-demoer-btn web-demoer-btn-prev">Prev</button>
                    <button class="web-demoer-btn web-demoer-btn-next">Next</button>
                </div>
            </div>
        `;
        
        container.appendChild(dialog);
        document.body.appendChild(container);

        // Store element references
        this.elements = {
            container,
            svg: container.querySelector('svg'),
            hole: container.querySelector('#demoer-target-hole'),
            outline: container.querySelector('#demoer-target-outline'),
            arrow: container.querySelector('#demoer-arrow-curve'),
            dialog,
            title: dialog.querySelector('.web-demoer-title'),
            content: dialog.querySelector('.web-demoer-content'),
            progress: dialog.querySelector('.web-demoer-progress'),
            btnPrev: dialog.querySelector('.web-demoer-btn-prev'),
            btnNext: dialog.querySelector('.web-demoer-btn-next'),
            btnClose: dialog.querySelector('.web-demoer-btn-close')
        };
        
        // Attach static listeners
        this.elements.btnPrev.addEventListener('click', () => this.prev());
        this.elements.btnNext.addEventListener('click', () => this.next());
        this.elements.btnClose.addEventListener('click', () => this.stop());
    }

    start(stepsToRun) {
        if (stepsToRun) this.steps = stepsToRun;
        if (!this.steps || this.steps.length === 0) {
            console.warn('WebDemoer: No steps provided.');
            return;
        }
        
        this._buildDOM();
        this.currentStepIndex = 0;
        this.isActive = true;
        
        // Add global listeners
        window.addEventListener('resize', this._handleResize);
        window.addEventListener('scroll', this._handleScroll);
        window.addEventListener('keydown', this._handleKeyDown);
        
        // Show container
        this.elements.container.classList.add('demoer-active');
        
        // Disable scroll slightly (optional, depending on user preference)
        // document.body.style.overflow = 'hidden'; 
        
        this._renderStep();
        if (typeof this.onStart === 'function') this.onStart(this.currentStepIndex);
    }

    stop() {
        if (!this.isActive) return;
        this.isActive = false;
        
        // Remove global listeners
        window.removeEventListener('resize', this._handleResize);
        window.removeEventListener('scroll', this._handleScroll);
        window.removeEventListener('keydown', this._handleKeyDown);
        
        // Hide container
        if (this.elements.container) {
            this.elements.container.classList.remove('demoer-active');
            // Remove from DOM entirely after transition
            setTimeout(() => {
                if(this.elements.container && this.elements.container.parentNode) {
                    this.elements.container.parentNode.removeChild(this.elements.container);
                }
                this.elements.container = null;
            }, 500);
        }
        
        if (typeof this.onStop === 'function') this.onStop(this.currentStepIndex);
    }

    next() {
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this._renderStep();
            if (typeof this.onNext === 'function') this.onNext(this.currentStepIndex);
        } else {
            this.stop();
        }
    }

    prev() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this._renderStep();
            if (typeof this.onPrev === 'function') this.onPrev(this.currentStepIndex);
        }
    }

    _handleResize() {
        if (!this.isActive) return;
        this._updateVisuals(true);
    }

    _handleScroll() {
        if (!this.isActive) return;
        this._updateVisuals(true);
    }

    _handleKeyDown(e) {
        if (!this.isActive) return;
        if (e.key === 'Escape') this.stop();
        if (e.key === 'ArrowRight' || e.key === 'Enter') {
            e.preventDefault();
            this.next();
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.prev();
        }
    }

    _renderStep() {
        const step = this.steps[this.currentStepIndex];
        
        // Update dialog content
        this.elements.title.textContent = step.title || '';
        this.elements.content.innerHTML = step.description || '';
        this.elements.progress.textContent = `Step ${this.currentStepIndex + 1} of ${this.steps.length}`;
        
        // Update buttons
        this.elements.btnPrev.style.display = this.currentStepIndex === 0 ? 'none' : 'block';
        this.elements.btnNext.textContent = this.currentStepIndex === this.steps.length - 1 ? 'Finish' : 'Next';

        // Scroll to target element if it's not well in view
        const targetEl = document.querySelector(step.element);
        if (targetEl) {
            const rect = targetEl.getBoundingClientRect();
            // Check visibility
            const inView = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
            
            if (!inView) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // We'll update visuals repeatedly while scrolling
                this._animateScrollRecalculation();
            } else {
                this._updateVisuals();
            }
        } else {
            // Target not found, clear visuals
            this._updateVisuals(); 
        }
        
        // Restart arrow animation
        const arrow = this.elements.arrow;
        if(arrow) {
            arrow.style.animation = 'none';
            arrow.offsetHeight; // trigger reflow
            arrow.style.animation = null; 
        }
    }
    
    _animateScrollRecalculation() {
        const _this = this;
        let count = 0;
        function stepRecalc() {
            _this._updateVisuals(true);
            count++;
            if (count < 30) {
                requestAnimationFrame(stepRecalc);
            }
        }
        requestAnimationFrame(stepRecalc);
    }

    _updateVisuals(fastUpdate = false) {
        if (!this.isActive) return;

        const step = this.steps[this.currentStepIndex];
        const targetEl = document.querySelector(step.element);
        
        // Center dialog rect
        const dialogRect = this.elements.dialog.getBoundingClientRect();
        
        if (!targetEl) {
            // No target, hide hole and arrow
            this.elements.hole.setAttribute('width', '0');
            this.elements.hole.setAttribute('height', '0');
            this.elements.outline.setAttribute('width', '0');
            this.elements.outline.setAttribute('height', '0');
            this.elements.arrow.setAttribute('d', '');
            return;
        }

        const targetRect = targetEl.getBoundingClientRect();
        
        // Add padding around target
        const p = this.padding;
        const hX = targetRect.left - p;
        const hY = targetRect.top - p;
        const hW = targetRect.width + (p * 2);
        const hH = targetRect.height + (p * 2);

        // Update hole
        this.elements.hole.setAttribute('x', hX);
        this.elements.hole.setAttribute('y', hY);
        this.elements.hole.setAttribute('width', hW);
        this.elements.hole.setAttribute('height', hH);
        
        // Update outline
        this.elements.outline.setAttribute('x', hX);
        this.elements.outline.setAttribute('y', hY);
        this.elements.outline.setAttribute('width', hW);
        this.elements.outline.setAttribute('height', hH);

        // Calculate beautiful curvy arrow (cubic bezier)
        // from center dialog to target
        
        // Center dialog box
        const dX = dialogRect.left;
        const dY = dialogRect.top;
        const dW = dialogRect.width;
        const dH = dialogRect.height;
        
        // Let's find best edges to connect
        const dCx = dX + dW / 2;
        const dCy = dY + dH / 2;
        
        const tCx = hX + hW / 2;
        const tCy = hY + hH / 2;
        
        // Determining start point (on dialog) and end point (on target padding box)
        let startX, startY, endX, endY;
        let curveFactorX, curveFactorY;
        
        // Logic: if target is roughly above, below, left or right
        const dxDelta = tCx - dCx;
        const dyDelta = tCy - dCy;
        
        if (Math.abs(dxDelta) > Math.abs(dyDelta)) {
            // Horizontal connection
            if (dxDelta > 0) {
                // Target to the right
                startX = dX + dW; startY = dCy;
                endX = hX; endY = tCy;
            } else {
                // Target to the left
                startX = dX; startY = dCy;
                endX = hX + hW; endY = tCy;
            }
            // Control points offset
            const dist = Math.abs(endX - startX) * 0.5;
            curveFactorX = startX < endX ? dist : -dist;
            const path = `M ${startX},${startY} C ${startX + curveFactorX},${startY} ${endX - curveFactorX},${endY} ${endX},${endY}`;
            this.elements.arrow.setAttribute('d', path);
            
        } else {
            // Vertical connection
            if (dyDelta > 0) {
                // Target below
                startX = dCx; startY = dY + dH;
                endX = tCx; endY = hY;
            } else {
                // Target above
                startX = dCx; startY = dY;
                endX = tCx; endY = hY + hH;
            }
            // Control points offset
            const dist = Math.abs(endY - startY) * 0.5;
            curveFactorY = startY < endY ? dist : -dist;
            
            // To make the arrow visually stunning and curvy, we add a sweep if it's offset horizontally too
            const hOffset = (endX - startX) * 0.8;
            
            const path = `M ${startX},${startY} C ${startX},${startY + curveFactorY} ${endX - hOffset},${endY - curveFactorY} ${endX},${endY}`;
            this.elements.arrow.setAttribute('d', path);
        }
    }
}

// Export as global
window.WebDemoer = WebDemoer;
