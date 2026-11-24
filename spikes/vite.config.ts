import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Scans live in the repo's gitignored captures/ folder and are served from there, never copied into git.
export default defineConfig({ plugins: [react()], publicDir: '../captures', server: { host: true } });
