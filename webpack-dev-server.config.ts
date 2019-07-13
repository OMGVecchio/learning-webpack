import webpack from 'webpack'
import merge from 'webpack-merge'
import config from './webpack.config'

const devServerConfig: webpack.Configuration = {
  "output": {
    filename: '[name].js'
  },
  "devServer": {
    host: 'localhost',
    port: 8080,
    hot: true,
    open: true
  }
} as any

export default merge(devServerConfig, config)
