# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local development (serves from Obsidian vault at Z:/obsidian/note)
npm run preview

# Type check and format check
npm run check

# Auto-format
npm run format

# Run tests
npm run test

# Run a single test file
npx tsx --test quartz/util/path.test.ts

# Sync published notes from Obsidian vault to content/
npm run sync-content

# Full publish: sync + commit + push
npm run publish

# Build without serving
npx quartz build
```

## Architecture Overview

Quartz is a static site generator that converts Markdown (primarily from Obsidian) into a website.

### Entry Point & Build Pipeline

`quartz/bootstrap-cli.mjs` → esbuild-transpiles → `quartz/build.ts`

The build pipeline is: **Parse → Filter → Emit**

1. **Parse** (`quartz/processors/parse.ts`): Reads `.md` files from `content/`, applies transformer plugins through a unified/remark/rehype pipeline
2. **Filter** (`quartz/processors/filter.ts`): Runs filter plugins to exclude certain content (e.g. draft/unpublished notes)
3. **Emit** (`quartz/processors/emit.ts`): Runs emitter plugins to write output HTML, assets, feeds, etc. to `public/`

### Plugin System

All plugins are in `quartz/plugins/` and typed in `quartz/plugins/types.ts`. Three plugin types:

- **Transformers** (`quartz/plugins/transformers/`): Map over individual files — text transforms, remark (mdast) and rehype (hast) plugin lists. Export from `index.ts`.
- **Filters** (`quartz/plugins/filters/`): Decide whether a file is published via `shouldPublish()`.
- **Emitters** (`quartz/plugins/emitters/`): Reduce all content to output files — HTML pages, sitemaps, RSS, OG images, etc. Export from `index.ts`.

### Configuration Files (User-Facing)

- **`quartz.config.ts`**: Global settings (title, baseUrl, theme colors/fonts, analytics) and the plugin list. This is the primary file for customizing behavior.
- **`quartz.layout.ts`**: Page layout — which UI components appear in which zones (`left`, `right`, `beforeBody`, `header`, `footer`). Uses `SharedLayout` (all pages) and `PageLayout` (content vs. list pages).

### Components

`quartz/components/*.tsx` — Preact components rendered server-side. Each component can declare:
- Client-side scripts via `.inline.ts` files in `quartz/components/scripts/` (bundled for browser)
- Styles via `.scss` files
- External resources

The page render entry point is `quartz/components/renderPage.tsx`.

### Content Sync Workflow

`scripts/sync-content.mjs` syncs notes from the Obsidian vault (`Z:/obsidian/note`) to `content/`. It only copies notes that have a `#Publish` tag (inline or in frontmatter), plus their referenced assets. Hidden dirs, `copilot/`, `templates/`, and `private/` are excluded.

Publishing filter in `quartz.config.ts` uses `Plugin.FilterPublishTag()` which reads this tag at build time too.

### Custom Additions

- `Plugin.InlineTagsToFrontmatter()`: Custom transformer that promotes inline `#tags` to frontmatter
- `Plugin.FilterPublishTag()`: Custom filter that gates publishing on `#Publish` tag presence
- `Plugin.FilteredAssets()`: Custom emitter (`quartz/plugins/emitters/assetsFiltered.ts`) that only emits assets referenced by published pages

### Path Handling

Path logic is complex — see `quartz/util/path.ts` and `docs/advanced/paths.md`. Slugs use `FullSlug`, `SimpleSlug`, and `RelativeURL` types that are not interchangeable.

### Client-Side

The browser receives `public/prescript.js` (before DOM) and `public/postscript.js` (after DOM). Components dispatch a synthetic `"nav"` event for setup/teardown. When SPA routing is enabled (`enableSPA: true` in config), `"nav"` fires on every client navigation.
