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
  port: '5000',
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
    external: ['three'],
    input: 'src/MeshLayeredMaterial.js',
    plugins,
    output: {
      globals: {
        three: 'THREE',
      },
      file: 'dist/js/MeshLayeredMaterial.js',
      format: 'iife',
      name: 'MeshLayeredMaterial'
    },
  }, 
  {
    external: ['three'],
    input: 'src/MaterialLayer.js',
    plugins,
    output: {
      globals: {
        three: 'THREE',
      },
      file: 'dist/js/MaterialLayer.js',
      format: 'iife',
      name: 'MaterialLayer',
    }
  },
  {
    external: ['three'],
    input: 'src/MeshLayeredMaterial.js',
    plugins,
		output: {
			name: 'MeshLayeredMaterial',
			file: 'dist/jsm/MeshLayeredMaterial.js',
			format: 'es'
		},
  }, 
  {
    external: ['three'],
    input: 'src/MaterialLayer.js',
    plugins,
    output: {
      file: 'dist/jsm/MaterialLayer.js',
      format: 'es',
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
