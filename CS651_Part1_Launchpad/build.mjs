import {build} from 'esbuild';
import {cp,mkdir,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
await build({entryPoints:['src/workspace.jsx','src/login.jsx','src/static.js'],bundle:true,outdir:'dist/assets',minify:true,loader:{'.svg':'file'},define:{'process.env.NODE_ENV':'"production"'}});
await cp('node_modules/bootstrap/dist/css/bootstrap.min.css','dist/assets/bootstrap.min.css');
