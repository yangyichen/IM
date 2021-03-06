var path = require('path')
var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/main.js',
    vendors: './node_modules/jquery/dist/jquery.min.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: 'dist/',
    filename: '[name].js'
  },
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
            // the "scss" and "sass" values for the lang attribute to the right configs here.
            // other preprocessors should work out of the box, no loader config like this necessary.
            'scss': 'vue-style-loader!css-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
          },
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new HtmlWebpackPlugin({
      title: 'IM',
      filename: 'index.html',
      chunks: ['app', 'vendors'],
    }),
  ],
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    historyApiFallback: true,
    noInfo: true,
    proxy: {
      '/test/*': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false
      }
    }
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}
process.noDeprecation = true;
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}