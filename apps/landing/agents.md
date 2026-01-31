# AGENTS.md - Landing Page

For workspace-wide conventions and setup, see [docs/agents.md](../../docs/agents.md).

## Project Overview

Static landing page website built with Astro. Serves as the public-facing homepage and marketing site for AppTales Analytics.

### Tech Stack

- **Framework**: Astro (^5.14.1)
- **Styling**: CSS and Astro components with Tailwind CSS (^4.1.14)
- **Content**: Markdown and component-based
- **Deployment**: Docker containerized
- **TypeScript**: Strict mode with Astro config

## Dev Environment & Setup

### Start Development Server

```bash
pnpm -F @apptales/landing dev
```

Opens dev server at http://localhost:3000 (or configured port).

### Build

```bash
pnpm -F @apptales/landing build
```

Creates static site output in `dist/` folder.

### Preview Production Build

```bash
pnpm -F @apptales/landing preview
```

## Project Structure

```
src/
├── layouts/          - Page layout templates
├── pages/            - Astro pages and routes (URL-based)
├── components/       - Reusable Astro components
├── assets/           - Images, fonts, and static files
└── styles/           - Global and component styles

public/              - Static assets (images, videos, documents)
├── images/
└── videos/
```

## Astro Components & Pages

### Page Structure

- Pages in [src/pages/](./src/pages/) become routes automatically
- `index.astro` = `/`
- `about.astro` = `/about`
- `blog/post.astro` = `/blog/post`

### Component Files

- `.astro` files are Astro components (server-side rendered)
- Use `.tsx` only if interactive (requires hydration)
- File names: PascalCase (`Header.astro`, `FeatureCard.astro`)

### Layout Usage

```astro
---
import Layout from '../layouts/MainLayout.astro';
---

<Layout title="Page Title">
  <h1>Page content here</h1>
</Layout>
```

## Astro-Specific Patterns

### Static Site Generation (SSG)

- Pages are pre-built to static HTML at build time
- No server needed for deployment
- Use prerendering for dynamic routes if needed

### Component Props

```astro
---
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div>
  <h1>{title}</h1>
  {description && <p>{description}</p>}
</div>
```

### Frontmatter (Top of File)

```astro
---
// This code runs on the server during build
import Layout from '../layouts/Layout.astro';

const pageTitle = "About";
---

<Layout title={pageTitle}>
  <!-- Template rendered to HTML -->
</Layout>
```

### Dynamic Routes

For dynamic content, use `[param].astro` files and generate static paths:

```astro
---
// [id].astro
export async function getStaticPaths() {
  const posts = await fetchAllPosts();
  return posts.map(post => ({
    params: { id: post.id },
    props: { post }
  }));
}

const { post } = Astro.props;
---

<article>
  <h1>{post.title}</h1>
  <p>{post.content}</p>
</article>
```

## Styling

### Global Styles

- Define in [src/styles/](./src/styles/)
- Import in layouts for site-wide styling
- Follow CSS naming conventions (BEM or similar)

### Component Scoping

```astro
---
import './Card.css'; // Scoped styles
---

<div class="card">
  <h2>Card Title</h2>
</div>
```

### Responsive Design

- Use CSS media queries
- Mobile-first approach
- Test at common breakpoints

## Content & Markdown

### Markdown Pages

```markdown
---
title: "Page Title"
description: "SEO description"
---

# Heading

Content here...
```

### Embedding Components in Markdown

Use Astro's `.mdx` files to mix Markdown and components:

```mdx
---
title: "Blog Post"
---

# Title

<FeatureCard title="Feature" />

Regular markdown content...
```

## Assets & Images

### Public Assets

- Static files in [public/](./public/) folder
- Referenced as `/images/logo.png`
- Not processed by Astro

### Optimized Images

- Use Astro's Image component for optimization:

```astro
---
import { Image } from 'astro:assets';
import logo from '../assets/logo.svg';
---

<Image src={logo} alt="Logo" width={200} height={200} />
```

## Build & Deployment

### Static Output

```bash
pnpm -F @apptales/landing build
```

Generates static HTML files in `dist/` folder.

### Docker Deployment

[Dockerfile](./Dockerfile) provides containerization for deployment.

Build Docker image:

```bash
docker build -t apptales-landing:latest .
```

### Environment Variables

- Use in `.env` or `.env.local`
- Access in Astro with `import.meta.env.VARIABLE_NAME`

## Testing

### Run Tests

```bash
pnpm -F @apptales/landing test
```

### Testing Considerations

- Static pages: Verify HTML output
- Dynamic content: Test data fetching
- Responsive layout: Visual regression testing

## SEO Best Practices

### Meta Tags

Always include in layouts:

```astro
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:image" content={imagePath} />
```

### Structured Data

Use JSON-LD for search engine optimization:

```astro
---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AppTales Analytics",
};
---

<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />
```

### Sitemap & Robots

Astro auto-generates these if configured:

- `/sitemap.xml` - All pages
- `/robots.txt` - Crawler instructions

## Performance

### Asset Optimization

- Compress images before including
- Use WebP format where possible
- Lazy-load off-screen images

### Build Size

- Check build output for large files
- Remove unused components
- Monitor CSS file sizes

## Common Tasks

### Add a New Page

1. Create `.astro` file in [src/pages/](./src/pages/)
2. Use appropriate layout from [src/layouts/](./src/layouts/)
3. Add to navigation if needed
4. Test build output

### Create a Reusable Component

1. Create in [src/components/](./src/components/)
2. Define props interface
3. Use in pages/layouts
4. Document props and usage

### Add Images

1. Place in [public/images/](./public/images/)
2. Reference with `/images/filename.png`
3. Or import in component and use with Image component

## Astro Configuration

- Config file: [astro.config.mjs](./astro.config.mjs)
- Output format, build settings, and integrations

## Code Style

- Follow TypeScript strict mode
- Use descriptive names
- Keep components focused and reusable
- Comment complex logic
- Validate all user input

## Related Documentation

- Root conventions: [docs/agents.md](../../docs/agents.md)
- Astro docs: https://docs.astro.build/
- TypeScript config: [tsconfig.json](./tsconfig.json)
- Docker: [Dockerfile](./Dockerfile)
