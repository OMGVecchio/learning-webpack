import path from 'path'
import os from 'os'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ManifestPlugin from 'webpack-manifest-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'


/** 以下用 es6 import 语法报错，没 @types */
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
/** 以下用 es6 import 找不到某些方法，有 @types */
const HappyPack = require('happypack')

const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const createHappyPlugin = (id: string, loaders: any) => new HappyPack({
  id,
  loaders,
  threadPool: happyThreadPool,
  verbose: process.env.HAPPY_VERBOSE === '1'
})

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
      // use: 'ts-loader',
      /** 报错，是 ts-loader 不支持 happypack？  */
      use: 'happypack/loader?id=happy-ts'
    }, {
      test: /\.js$/,
      include: path.resolve(__dirname, 'src'),
      // use: 'babel-loader',
      use: 'happypack/loader?id=happy-babel'
    }]
  },
  "plugins": [
    /** 文件清理 */
    new CleanWebpackPlugin(),

    /** html 模板 */
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

    /** happypack */
    createHappyPlugin('happy-babel', [{
      loader: 'babel-loader',
      options: {
        babelrc: true,
        // 启用缓存
        cacheDirectory: true
      }
    }]),
    createHappyPlugin('happy-ts', [{
      loader: 'ts-loader',
      options: {
        // 只做编译，类型检测通过 fork-ts-checker-webpack-plugin 另起线程完成
        transpileOnly: true,
        experimentalWatchApi: true,
        // ts-loader 开启 happypack，必须配置该属性
        happyPackMode: true
      }
    }]),

    /** 新起线程做 ts 类型检测 */
    new ForkTsCheckerWebpackPlugin(),

    /** 构建资源映射 */
    // new ManifestPlugin(),

    /** 构建分析 */
    // new BundleAnalyzerPlugin(),
    // new SpeedMeasurePlugin(),

    /** 构建过程输出 */
    // new webpack.ProgressPlugin(),

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
