var path = require('path');
var webpack = require('webpack');

var projectRoot = path.resolve(__dirname, '..');
var srcRoot = path.resolve(projectRoot, 'src');

module.exports = {
  devtool: 'inline-source-map',
  context: srcRoot,
  resolve: {
    extensions: ['.ts', '.js']
  },
  entry: {
    test: './test.ts'
  },
  output: {
    path: './dist.test',
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'tslint-loader',
        exclude: [
          /\.spec\.ts/,
          /node_modules/
        ],
        options: {
          emitErrors: true,
          failOnHint: false,
          resourcePath: path.resolve(projectRoot)
        },
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader',
        exclude: [
          path.resolve(projectRoot, 'node_modules/angular')
        ]
      },
      {
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: [path.resolve(projectRoot, 'node_modules/angular')],
        enforce: 'pre'
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              tsconfig: path.resolve(srcRoot, 'tsconfig.json'),
              module: 'commonjs',
              target: 'es5',
              useForkChecker: true
            }
          }
        ]
      },
      {
        test: /\.(js|ts)$/, loader: 'sourcemap-istanbul-instrumenter-loader',
        enforce: 'post',
        exclude: [
          /\.spec\.ts$/,
          /node_modules/
        ],
        options: {'force-sourcemap': true}
      }
    ]
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: null,
      test: /\.(ts|js)($|\?)/i
    }),
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
      srcRoot
    )
  ],
  node: {
    fs: 'empty',
    global: true,
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
