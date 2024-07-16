import { build } from 'gluegun';

build()
  .brand('juansev')
  .src(__dirname)
  .plugins('./node_modules', { matching: 'juansev-*', hidden: true })
  .help()
  .version()
  .create()
  .run();
