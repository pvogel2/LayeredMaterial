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
  nodeResolve({
     extensions: ['.js', '.jsx']
  }),
  babel({
    babelHelpers: 'bundled',
    presets: ['@babel/preset-react'],
    extensions: ['.js', '.jsx'],
    exclude: [/node_modules/],
  }),
  commonjs(),
  replace({
     preventAssignment: false,
     'process.env.NODE_ENV': '"development"'
  })
];

const config = [
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
];

if (process.env.npm_lifecycle_event === 'dev')  {
  config.push({
    input: 'src/dev/index.js',
    // external: ['three'],
    plugins: [...plugins, // so Rollup can convert `ms` to an ES module
      serve(serveConfig),
      livereload(),
    ],
    output: {
      file: 'build/index.js',
      format: 'iife',
      /* globals: {
        three: 'THREE',
        react: 'React',
        'react-dom': 'ReactDOM',
      //  material: 'material',
      },*/
    },
    // @see https://github.com/rollup/rollup/issues/4699
    onwarn: function ( message ) {
      if ( message.code === 'MODULE_LEVEL_DIRECTIVE') return;
      console.warn( message );
    }
  });
}

export default config;