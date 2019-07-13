import path from 'path'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
/** 以下 import es6 语法报错 */
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')


const config: webpack.Configuration = {
  /** V4 必配置 */
  // mode: 'development',
  "entry": {
    dependency: './src/pages/dependency/a',
    react: './src/pages/react/index'
  },
  "output": {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]_[chunkhash].js',
    // chunkFilename: '[name].bundle.js',
  },
  "module": {
    rules: [{
      test: /\.tsx$/,
      include: path.resolve(__dirname, 'src'),
      use: 'ts-loader'
    }]
  },
  "plugins": [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'dependency',
      filename: 'pages/dependency.html',
      template: './src/index.html'
    }),
    new HtmlWebpackPlugin({
      title: 'react',
      filename: 'pages/react.html',
      template: './src/index.html'
    }),
    new ManifestPlugin(),
    // new BundleAnalyzerPlugin(),
    // new SpeedMeasurePlugin(),
    new webpack.ProgressPlugin(),
    /** v4 中被移除 */
    // new webpack.optimize.CommonsChunkPlugin()
  ],
  "optimization": {
    splitChunks: {
      chunks: 'all',
      minSize: 3000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: true,
    minimizer: [
      // 多进程压缩
      new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: {
          output: {
            comments: false,
            beautify: false
          },
          compress: {
            warning: false,
            drop_console: true,
            collapse_vars: true,
            reduce_vars: true
          }
        }
      })
    ]
  },
  "resolve": {
    extensions: ['.js', '.tsx']
  }
}

export default config
