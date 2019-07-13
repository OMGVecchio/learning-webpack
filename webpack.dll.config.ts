import path from 'path'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'

// dll文件存放的目录
const dllPath = path.resolve(__dirname, "./src/assets/dll")

export default {
  "entry": {
    vender: ['react', 'react-dom', 'lodash', 'jquery']
  },
  "output": {
    
    path: dllPath,
    filename: "[name]_[hash].dll.js",
    library: "[name]_[hash]"
  },
  "plugins": [
    new CleanWebpackPlugin(),
    new webpack.DllPlugin({
      name: '[name]_[hash]',
      // manifest.json 描述动态链接库包含了哪些内容
      path: path.resolve(__dirname, '[name].dll.manifest.json')
    }),
  ],
}
