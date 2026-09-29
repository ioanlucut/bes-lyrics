# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BES-Lyrics is a TypeScript-based tool for managing Romanian Christian song lyrics for Biserica Emanuel Sibiu (BES). The project includes parsing, validation, formatting, and LaTeX songbook generation capabilities.

## Key Commands

### Development & Testing
- `npm test` - Run tests (auto-detects CI environment)
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Type-check all TypeScript (`ts-node` only transpiles)
- `npm run format` - Format all lyrics files and TypeScript code

### Build & Validation
- `npm run build:ci` - Full CI build (lint + test + validate)
- `npm run verify` - Validate lyrics content structure
- `npm run verify:file-extensions` - Check file extensions
- `npm run verify:uniqueness-of-ids` - Ensure unique song IDs
- `npm run verify:similarity` - Check for duplicate songs

### Content Processing
- `npm run reprocess:content` - Reprocess lyrics content
- `npm run reprocess:filename` - Standardize filenames
- `npm run meta:ci` - Complete metadata processing pipeline

### Dictionary & Analysis
- `npm run dictionary:analyze` - Analyze Romanian dictionary usage
- `npm run dictionary:update` - Update custom dictionary

### Songbook Generation
- `npm run songbook:convert` - Convert lyrics to LaTeX format
- `npm run songbook:compile` - Generate PDF songbook
- `npm run songbook:dist` - Full songbook build pipeline

## Architecture

### Core Modules (`src/`)
- **songParser.ts** - Parses custom lyrics format into AST
- **songPrinter.ts** - Converts AST back to formatted text
- **contentStructureValidator.ts** - Validates song structure and content
- **core.ts** - Shared utilities and helper functions
- **types.ts** - TypeScript definitions for song structure

### Song Format
Songs use a custom format with sections like `[title]`, `[sequence]`, `[v1]`, `[c]`, etc. The parser converts this to a structured AST with metadata and content sections.

### Validation Tools (`bin/`)
`build:ci` blocks pull requests on file extensions, ID uniqueness, lead-sheet sync, and characters plus structure (`verify`). Similarity (`verify:similarity`) and the Romanian dictionary (`dictionary:analyze`) are manual reports, not gates. `docs/architecture.md` is the reference for every check, the metadata bot, and the workflows; keep it in step when they change.

### Processing Pipeline
1. Parse lyrics files into structured format
2. Validate content and metadata
3. Apply content transformations
4. Generate formatted output (text/LaTeX)

## File Structure
- `verified/` - Chord-free canonical lyrics published to ProPresenter
- `leadsheets/` - Chorded song variants used for PDF generation
- `candidates/` - New songs pending review
- `LaTeX/` - Songbook generation templates and output
- `bin/` - CLI validation and processing tools
- `mocks/` - Test fixtures

## Mandatory Leadsheets Skill

Before creating or editing songs, writing or auditing Leadsheets TeX, changing chord rendering or songbook layout, or diagnosing PDF compilation:

1. Load `skills/bes-song-leadsheets/SKILL.md`.
2. Choose the chord-free canonical, paired lead-sheet, direct-TeX, or audit route.
3. Use the capability map and search the official manual for exact package semantics.

The skill documents the complete Leadsheets v0.7 capability surface without vendoring the upstream manual or package.

## Development Notes
- Uses ES modules with TypeScript
- Tests run with Jest and ts-jest
- Prettier handles code formatting including custom lyrics format
- Custom Prettier plugin for `.txt` lyrics files
- Node.js with experimental loader for ES modules

## GitHub Claude Review

- Every PR must receive a completed GitHub Claude review before merge.
- After opening a PR, comment `@claude review` and wait for the `claude[bot]` response; a successful workflow run alone does not mean the review passed.
- Resolve every actionable finding. After material fixes, request another review and do not merge until the latest review reports no blocking findings.
- If the Claude review is unavailable or fails, stop and report it instead of substituting a self-review or another reviewer.
