[1mdiff --git a/.gitignore b/.gitignore[m
[1mindex 71979e8..7939ad5 100644[m
[1m--- a/.gitignore[m
[1m+++ b/.gitignore[m
[36m@@ -1,16 +1,41 @@[m
[31m-# v0 sandbox internal files[m
[31m-__v0_runtime_loader.js[m
[31m-__v0_devtools.tsx[m
[31m-__v0_jsx-dev-runtime.ts[m
[31m-.snowflake/[m
[31m-.design-cache/[m
[31m-.v0-trash/[m
[31m-.vercel/[m
[31m-[m
[31m-# Environment variables[m
[31m-.env*.local[m
[31m-[m
[31m-# Common ignores[m
[31m-node_modules[m
[31m-.next/[m
[31m-.DS_Store[m
\ No newline at end of file[m
[32m+[m
[32m+[m[32m# Dependencies[m
[32m+[m[32m/node_modules[m
[32m+[m[32m/.pnp[m
[32m+[m[32m.pnp.*[m
[32m+[m[32m.yarn/*[m
[32m+[m[32m!.yarn/patches[m
[32m+[m[32m!.yarn/plugins[m
[32m+[m[32m!.yarn/releases[m
[32m+[m[32m!.yarn/versions[m
[32m+[m
[32m+[m[32m# Testing[m
[32m+[m[32m/coverage[m
[32m+[m
[32m+[m[32m# Next.js[m
[32m+[m[32m/.next/[m
[32m+[m[32m/out/[m
[32m+[m
[32m+[m[32m# Production[m
[32m+[m[32m/build[m
[32m+[m
[32m+[m[32m# Misc[m
[32m+[m[32m.DS_Store[m
[32m+[m[32m*.pem[m
[32m+[m
[32m+[m[32m# Debug logs[m
[32m+[m[32mnpm-debug.log*[m
[32m+[m[32myarn-debug.log*[m
[32m+[m[32myarn-error.log*[m
[32m+[m[32m.pnpm-debug.log*[m
[32m+[m
[32m+[m[32m# Environment variables — do not commit secrets[m
[32m+[m[32m.env*[m
[32m+[m[32m!.env.example[m
[32m+[m
[32m+[m[32m# Vercel[m
[32m+[m[32m.vercel[m
[32m+[m
[32m+[m[32m# TypeScript[m
[32m+[m[32m*.tsbuildinfo[m
[32m+[m[32mnext-env.d.ts[m
