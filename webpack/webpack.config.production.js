const path = require('path');

const externals = {
  'react': {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'React'
  },
  'react-dom': {
    root: 'ReactDOM',
    commonjs2: 'react-dom',
    commonjs: 'react-dom',
    amd: 'ReactDOM'
  },
  'react-spring': {
    root: 'ReactSpring',
    commonjs2: 'react-spring',
    commonjs: 'react-spring',
    amd: 'ReactSpring'
  }
};

module.exports = (env) => {
  const { mode } = env;

  const config = {
    mode,

    entry: {
      app: path.resolve(__dirname, '../src/index.js')
    },

    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'react-view-pager.js',
      library: 'ReactViewPager',
      libraryTarget: 'umd'
    },

    module: {
      rules: [
        {
          test: /.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        }
      ]
    },

    externals
  };

  return config;
};
