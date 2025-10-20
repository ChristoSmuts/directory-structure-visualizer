# Directory Structure Visualizer

A modern, accessible web application for parsing and visualizing directory structures with interactive editing and export capabilities.

## Features

- **Multiple Input Formats**: Support for both Markdown and ASCII tree formats
- **Interactive Visualization**: Expand/collapse folders, rename files and folders
- **Export Options**: 
  - Export as PNG image
  - Copy as formatted text
  - Copy as shell script (PowerShell, CMD, Bash, Zsh)
- **Fully Accessible**: WCAG AA compliant with comprehensive keyboard navigation
- **No Data Persistence**: All data is stored in memory only (cleared on refresh)

## Export Features

### Copy as Script

The "Copy as Script" feature generates executable shell scripts that recreate your directory structure. Choose from:

- **PowerShell**: For Windows PowerShell environments
- **CMD (Batch)**: For Windows Command Prompt
- **Bash**: For Linux, macOS, and WSL
- **Zsh**: For macOS (default shell) and Linux with Zsh

Each script will:
1. Create all directories in the structure
2. Create all files (empty files)
3. Display a success message when complete

Simply copy the script and run it in your terminal to recreate the directory structure.

## Accessibility Features

This application is built with accessibility as a core requirement:

### Keyboard Navigation
- **Arrow Keys**: Navigate up/down through the tree structure
- **Enter/Space**: Expand or collapse folders
- **F2**: Enable editing mode for renaming
- **Home/End**: Jump to first/last visible node
- **Tab**: Navigate between interactive elements
- **Escape**: Cancel editing mode

### Screen Reader Support
- Comprehensive ARIA labels on all interactive elements
- Live regions for status updates and error messages
- Semantic HTML structure with proper landmarks
- Tree role with proper treeitem hierarchy

### Visual Accessibility
- WCAG AA compliant color contrast ratios
- Focus indicators on all interactive elements
- Clear visual feedback for hover and active states
- Smooth transitions for expand/collapse (150-300ms)

### Skip Navigation
- Skip to main content link for keyboard users
- Proper heading hierarchy for screen reader navigation

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
