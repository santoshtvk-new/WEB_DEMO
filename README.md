# DemoFlow WebDemoer 🎯

A portable, ultra-lightweight Vanilla JS bundle for creating dynamic, visually appealing website walkthroughs with semi-transparent overlays and mathematically calculated curvy arrows.

No dependencies. No bloat. Just drop it in and start guiding your users gracefully.

## Features ✨
- **Dynamic Overlays**: Creates a beautiful dark mask over your page while precisely cutting a hole to highlight the target element. 
- **Curvy Arrows**: Instead of boring straight lines, it dynamically calculates stunning cubic-bezier curvy arrows pointing from the dialog directly to the highlighted spot.
- **Auto-Scrolling**: Intelligently scrolls target elements into view before rendering if they are outside the viewport.
- **Fully Customizable**: Modify colors, fonts, z-indexes, padding, and attach custom callbacks (`onStart`, `onNext`, `onPrev`, `onStop`).
- **No Dependencies**: 100% Vanilla JavaScript and CSS injection.

## Installation 📦

### Option 1: CDN / Drag-and-Drop
Simply include the minified script right before your closing `</body>` tag.

```html
<script src="https://pynfinity.com/cdn_bundles/web-demo-er.min.js"></script>
```

*(You can also use `web-demo-er.js` for the unminified version during development).*
```html
<script src="https://pynfinity.com/cdn_bundles/web-demo-er.js"></script>
```

## Quick Start 🚀

Create an array of "steps", telling DemoFlow which elements to point to, what title to display, and a brief description.

```javascript
document.addEventListener('DOMContentLoaded', () => {

    const demoer = new WebDemoer({
        steps: [
            {
                element: '#signup-btn',
                title: 'Sign Up',
                description: 'Click here to create your new account.'
            },
            {
                element: '.sidebar',
                title: 'Navigation',
                description: 'Use the sidebar to navigate through your dashboard.'
            }
        ],
        // Optional customizations
        overlayColor: 'rgba(15, 23, 42, 0.9)', 
        arrowColor: '#ec4899',
        dialogColor: '#f8f8f8ce' // Custom background color for the dialog
    });

    // Start the walkthrough
    demoer.start();

});
```

## API Reference & Customization 🛠️

When instantiating `new WebDemoer(options)`, you can pass the following settings into the `options` object:

| Configuration   | Type       | Default                               | Description                                                                 |
|-----------------|------------|---------------------------------------|-----------------------------------------------------------------------------|
| `steps`         | Array      | `[]`                                  | An array of step objects: `{ element: '#id', title: 'T', description: 'D' }`|
| `overlayColor`  | String     | `'rgba(15, 23, 42, 0.85)'`            | The background color of the full-screen mask (supports rgba for opacity).   |
| `arrowColor`    | String     | `'#3b82f6'`                           | The gradient start color of the curvy SVG arrow.                            |
| `dialogColor`   | String     | `'#ffffffe6'`                         | The background color of the central tooltip dialog (supports rgba or hex with alpha). |
| `arrowWidth`    | Number     | `4`                                   | The stroke width of the SVG arrow line.                                     |
| `borderRadius`  | Number     | `8`                                   | The border-radius applied to the highlight cutout mask.                     |
| `padding`       | Number     | `10`                                  | Extra padding (in pixels) added around the target element's highlight box.  |
| `zIndex`        | Number     | `9999999`                             | CSS z-index for the entire DemoFlow container overlay.                      |
| `fontFamily`    | String     | `'Inter', -apple-system, sans-serif`  | Font family applied to the central dialog text.                             |

### Callbacks 🔄

You can hook into the walkthrough lifecycle using these callback functions:

```javascript
const demoer = new WebDemoer({
    steps: [...],
    onStart: (stepIndex) => console.log('Demo started at step:', stepIndex),
    onNext: (stepIndex) => console.log('Advanced to step:', stepIndex),
    onPrev: (stepIndex) => console.log('Went back to step:', stepIndex),
    onStop: (lastIndex) => console.log('Demo stopped at step:', lastIndex)
});
```

## Methods 🎛️

Once instantiated, you have full control over the `demoer` instance:

- `demoer.start([steps])`: Starts the walkthrough. You can dynamically pass an array of steps here, or use the ones defined in your initial config.
- `demoer.stop()`: Closes the walkthrough entirely and unbinds event listeners.
- `demoer.next()`: Advances to the next step programmatically.
- `demoer.prev()`: Goes back one step programmatically.

## License 📄
MIT License. Free to use and customize!

## 🌐 Website

- 🔗 Visit: [pynfinity](https://pynfinity.com)
- 🧑‍💻 Author: [santoshtvk](https://www.linkedin.com/in/santoshtvk/)
