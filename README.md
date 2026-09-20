# KOFA Healthcare

The Next.js application lives in `kofa/`. The repository root forwards the usual commands to that app so you can work from either folder.

```powershell
npm run setup   # Install the app's locked dependencies on a fresh checkout
npm run dev     # Open http://localhost:3200
npm run build   # Build the production application
npm start       # Serve the production build on port 3200
```

Stop the development server before using `npm start` on the same port.

## This Windows working copy

Use `C:\Users\nohax\Documents\kofa`, outside OneDrive. The former `C:\Users\nohax\OneDrive\Documents\kofa` directory is empty; select the non-OneDrive folder as the Codex project folder.

```powershell
Set-Location 'C:\Users\nohax\Documents\kofa'
npm run dev
```

The application details, contact-delivery environment variables, and content provenance are in [kofa/README.md](kofa/README.md). Jing's requested structure is recorded in [the September 15 brief](kofa/docs/website-refresh-2026-09-15.md). Contact delivery needs the configured email provider or webhook; the UI provides an email fallback when neither is configured. Team biographies and portraits for Renee Masi and Dr. Meng Deng remain pending supplied content.
