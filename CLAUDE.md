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
Multiple validators ensure data quality:
- Text content validation
- File extension checks
- ID uniqueness verification
- Similarity detection for duplicates
- Romanian dictionary compliance

### Processing Pipeline
1. Parse lyrics files into structured format
2. Validate content and metadata
3. Apply content transformations
4. Generate formatted output (text/LaTeX)

## File Structure
- `verified/` - Validated song lyrics in custom format
- `candidates/` - New songs pending review
- `LaTeX/` - Songbook generation templates and output
- `bin/` - CLI validation and processing tools
- `mocks/` - Test fixtures

## Development Notes
- Uses ES modules with TypeScript
- Tests run with Jest and ts-jest
- Prettier handles code formatting including custom lyrics format
- Custom Prettier plugin for `.txt` lyrics files
- Node.js with experimental loader for ES modules