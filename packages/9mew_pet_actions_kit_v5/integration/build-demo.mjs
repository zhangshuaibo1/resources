import {build} from 'esbuild';
for (const name of ['website-pet-demo','planar-pet-demo','actions-demo']) {
  await build({entryPoints:[new URL(`./${name}.tsx`,import.meta.url).pathname],bundle:true,format:'esm',target:['es2022'],jsx:'automatic',minify:true,legalComments:'external',define:{'process.env.NODE_ENV':'"production"'},outfile:new URL(`./vendor/${name}.bundle.js`,import.meta.url).pathname});
}
