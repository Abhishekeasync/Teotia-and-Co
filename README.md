# TEOTIA & CO. Website - Next.js Version

This is a Next.js version of the TEOTIA & CO. Chartered Accountants website, successfully converted from static HTML.

## Features

- ✅ Next.js 16 with App Router
- ✅ TypeScript support
- ✅ Custom CSS (no framework overhead)
- ✅ Responsive design
- ✅ Static export ready (optimized for deployment)
- ✅ Next.js Image optimization
- ✅ SEO friendly
- ✅ Fast page loads

## Getting Started

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build

Build the project for production:

```bash
npm run build
```

### Start Production Server

Start the production server:

```bash
npm start
```

## Project Structure

```
├── app/
│   ├── about/          # About page
│   ├── blog/           # Blog page
│   ├── contact/        # Contact page
│   ├── services/       # Services page
│   ├── globals.css     # Global styles and fonts
│   ├── page-styles.css # Page-specific styles
│   ├── layout.tsx      # Root layout with Header & Footer
│   └── page.tsx        # Home page
├── components/
│   ├── Header.tsx      # Header component
│   └── Footer.tsx      # Footer component
├── public/
│   └── assets/         # Static assets (images, fonts, etc.)
└── next.config.js      # Next.js configuration
```

## Pages

- **Home** (`/`) - Main landing page with hero, services, testimonials, team, etc.
- **About** (`/about`) - About the company and team
- **Services** (`/services`) - List of services offered
- **Blog** (`/blog`) - Blog posts and insights
- **Contact** (`/contact`) - Contact information and hours

## Customization

### Colors

The color scheme is defined in CSS variables in `app/globals.css`:

```css
:root {
  --green: rgb(26,64,160);
  --green-hex: #1A40A0;
  --darker-teal: rgb(12,32,96);
  --medium-green: rgb(51,100,255);
  --blue-accent: rgb(26,106,255);
  --orange: rgb(255,178,51);
  --light-gray: rgb(245,247,250);
  --text-secondary: rgb(110,110,110);
  --border-dark: rgb(42,42,42);
  --footer-bg: rgb(26,26,46);
}
```

### Fonts

Custom fonts are loaded via `@font-face` declarations in `app/globals.css`.

## Static Export

This project is configured for static export. When you run `npm run build`, it will generate a static site in the `out/` directory that can be deployed to any static hosting service.

## Deployment

### Vercel (Recommended)

Deploy to Vercel:

```bash
npm i -g vercel
vercel
```

### Other Hosting

After building (`npm run build`), deploy the `out/` directory to:
- Netlify
- GitHub Pages
- AWS S3
- Any static hosting service

## Build Output

After running `npm run build`, the static site is generated in the `out/` directory with:
- Optimized HTML files for all pages
- Minified CSS and JavaScript
- Optimized images
- All static assets

## Notes

- All original HTML files are preserved in the root directory for reference
- Assets are located in `public/assets/`
- The project uses Next.js Image component for automatic image optimization
- Mobile-responsive menu is built into the Header component
- TypeScript is automatically configured by Next.js
- No CSS framework dependencies - pure, optimized CSS

## License

© 2025 TEOTIA & CO. All Rights Reserved.
