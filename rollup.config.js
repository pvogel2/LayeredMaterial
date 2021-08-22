import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';

export default [
  {
    input: 'src/MeshLayeredMaterial.js',
    plugins: [
      nodeResolve(), // so Rollup can find `ms`
      commonjs() // so Rollup can convert `ms` to an ES module
    ],
    output: {
      file: 'dist/MeshLayeredMaterial.js',
      format: 'iife',
      name: 'MeshLayeredMaterial'
    },
  }, 
  {
    input: 'src/MaterialLayer.js',
    plugins: [
      nodeResolve(), // so Rollup can find `ms`
      commonjs() // so Rollup can convert `ms` to an ES module
    ],
    output: {
      file: 'dist/MaterialLayer.js',
      format: 'iife',
      name: 'MaterialLayer',
    }
  },
  {
    external: ['react', 'react-dom'],
    input: 'src/dev/index.js',
    plugins: [
      nodeResolve(), // so Rollup can find `ms`
      babel({
        presets: ["@babel/preset-react"],
      }),
      commonjs() // so Rollup can convert `ms` to an ES module
    ],
    output: {
      file: 'build/index.js',
      format: 'iife',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    }
  },
];
