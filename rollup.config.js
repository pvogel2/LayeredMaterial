import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import replace from '@rollup/plugin-replace';

const serveConfig = {
  open: false,
  openPage: '/index.html',
  verbose:true,
  contentBase: ['dist', 'build', 'dev', 'node_modules'],
  host: 'localhost',
  port: '5001',
};

const plugins = [
  nodeResolve(), // so Rollup can find `ms`
  replace({
    preventAssignment: true,
    values: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    }
  }),
  commonjs(), // so Rollup can convert `ms` to an ES module
];

export default [
  {
    input: 'src/MeshLayeredMaterial.js',
    plugins,
    output: {
      file: 'dist/MeshLayeredMaterial.js',
      format: 'iife',
      name: 'MeshLayeredMaterial'
    },
  }, 
  {
    input: 'src/MaterialLayer.js',
    plugins,
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
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('production'),
        }
      }),
      babel({
        presets: ["@babel/preset-react"],
        babelHelpers: 'bundled',
      }),
      commonjs(), // so Rollup can convert `ms` to an ES module
      serve(serveConfig),
      livereload(),
    ],
    output: {
      file: 'build/index.js',
      format: 'iife',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
  },
];
