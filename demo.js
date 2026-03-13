// Initialize the Demo when DOM is ready
document.addEventListener('DOMContentLoaded', () => {

    // Define the sequence of tour steps
    const tourSteps = [
        {
            element: '#hero-highlight',
            title: 'Welcome to DemoFlow!',
            description: 'This is the <strong>WebDemoer</strong> library in action. Notice how the background dims and the target text is cleanly highlighted. The arrow is rendered beautifully dynamically!'
        },
        {
            element: '#start-demo-btn',
            title: 'Primary Call to Action',
            description: 'This is your main conversion point. DemoFlow helps you draw user attention right where it matters most on your landing pages.'
        },
        {
            element: '#github-btn',
            title: 'Secondary Links',
            description: 'You can point to secondary elements as well. We use smooth animations to transition out the mask and arrows when moving to the next step.'
        },
        {
            element: '#nav-start-tour',
            title: 'Top Navigation',
            description: 'Works seamlessly with fixed navigation bars. It perfectly calculates bounding client rects. Notice how you can put the item inside a fixed header effortlessly.'
        },
        {
            element: '#feature-card-2',
            title: 'Curvy Arrows',
            description: 'Our pride! A dynamically injected SVG creates a perfect cubic-bezier curve from the central dialog to your element. It automatically determines whether to originate from the top, bottom, left or right edge.'
        },
        {
            element: '#mid-page-action',
            title: 'Auto Scrolling',
            description: 'If an element is out of the viewport, WebDemoer will automatically smoothly scroll the page down to bring it into view before rendering the arrow.'
        },
        {
            element: '#review-box',
            title: 'Beautiful Anywhere',
            description: 'Whether dark mode overlays or light, the WebDemoer keeps your interface premium and highly engaging. Enjoy!'
        }
    ];

    // Create the Demoer instance
    const demoer = new WebDemoer({
        steps: tourSteps,
        overlayColor: 'rgba(15, 23, 42, 0.94)', // Slate overlay
        arrowColor: '#ec4899', // Pink arrow matching the secondary theme color
        arrowWidth: 4,
        borderRadius: 12,
        padding: 15,
        dialogColor: '#f8f8f8ce'
    });

    // Bind event listeners to start the demo
    document.getElementById('start-demo-btn').addEventListener('click', () => {
        demoer.start();
    });
    
    document.getElementById('nav-start-tour').addEventListener('click', (e) => {
        e.preventDefault();
        demoer.start();
    });

    // Start it automatically on page load for demonstration
    setTimeout(() => {
        demoer.start();
    }, 1000);

});
