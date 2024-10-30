// next.config.js
module.exports = {
    eslint: {
      // Ignorer les erreurs ESLint lors du build sur Vercel
      ignoreDuringBuilds: true,
    },
    typescript: {
      // Ignorer les erreurs TypeScript lors du build sur Vercel
      ignoreBuildErrors: true,
    },
  };
  