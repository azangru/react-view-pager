import resolve from 'rollup-plugin-node-resolve';
import common from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/react-view-pager.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/react-view-pager.esm.js',
      format: 'esm'
    }
  ],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile source code
    }),
    common()
  ],
   external: ['react', 'react-dom', 'react-spring']
};
