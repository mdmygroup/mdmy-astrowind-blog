/**
 * Astro Configuration File
 * -----------------------
 * This file controls the core settings for the Astro site build process.
 * It configures:
 *  - Build output settings (static site generation)
 *  - Site deployment URL and base path
 *  - All enabled integrations (Tailwind, MDX, sitemap, etc.)
 *  - Markdown processing plugins
 *  - Asset optimization settings
 *  - Path aliases for imports
 * 
 * This configuration is set up for deploying to a custom domain via GitHub Pages
 * and includes optimizations for performance and SEO.
 */

import path from 'path'; // Node.js path module for handling file paths
import { fileURLToPath } from 'url'; // Helper to convert file:// URLs to paths

import { defineConfig } from 'astro/config'; // Core Astro config function

// Astro integrations
import sitemap from '@astrojs/sitemap'; // Generates XML sitemap for SEO
import tailwind from '@astrojs/tailwind'; // Enables Tailwind CSS support
import mdx from '@astrojs/mdx'; // Enables MDX support for enhanced markdown
import partytown from '@astrojs/partytown'; // Loads external scripts in web workers
import icon from 'astro-icon'; // Icon handling integration
import compress from 'astro-compress'; // Minifies HTML/CSS/JS output
import type { AstroIntegration } from 'astro'; // TypeScript type for Astro integrations

// Custom integration for AstroWind theme
import astrowind from './vendor/integration';

// Custom markdown plugins for enhanced content features
import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

// Get the directory name of the current module file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Flag to control whether external scripts are enabled
const hasExternalScripts = false;
// Helper function to conditionally include external script integrations
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
  output: 'static', // Generates a static website (HTML/CSS/JS files)
  
  // Custom domain configuration (based on CNAME file)
  site: 'https://blog.mdmygroup.com', // Custom domain from CNAME
  base: '/', // Base path is root when using a custom domain
  
  integrations: [
    // Tailwind CSS configuration
    tailwind({
      applyBaseStyles: false, // Don't add base styles automatically, custom styling only
    }),
    sitemap(), // Generate an XML sitemap for search engines
    mdx(), // Enable MDX support for enhanced markdown content
    
    // Icon configuration for various icon sets
    icon({
      include: {
        tabler: ['*'], // Include all icons from the Tabler icon set
        'flat-color-icons': [
          // Include specific icons from flat-color-icons set
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),

    // Conditionally include Partytown for external scripts if enabled
    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] }, // Forward specific commands to the main thread (for Google Analytics)
      })
    ),

    // Asset compression for optimizing site performance
    compress({
      CSS: true, // Minify CSS
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false, // Keep attribute quotes for HTML compatibility
        },
      },
      Image: false, // Don't compress images (handled separately)
      JavaScript: true, // Minify JavaScript
      SVG: false, // Don't compress SVGs (may affect animations)
      Logger: 1, // Set logging level
    }),

    // Custom AstroWind theme integration
    astrowind({
      config: './src/config.yaml', // Path to theme configuration
    }),
  ],

  // Configure remote domains allowed for image optimization
  image: {
    domains: ['cdn.pixabay.com'], // Allow optimization of images from Pixabay
  },

  // Configure markdown processing
  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin], // Add reading time estimates to content
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin], // Make tables responsive and images lazy-loaded
  },

  // Vite configuration (bundler settings)
  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'), // Create an alias for imports from src directory
      },
    },
  },
});
