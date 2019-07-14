import path from 'path'
import webpack from 'webpack'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'

// dll文件存放的目录
const dllPath = path.resolve(__dirname, 'dist/dll')

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
      // dll 暴露的对象名，要与 output.library 一致
      name: '[name]_[hash]',
      // manifest.json 描述动态链接库包含了哪些内容
      path: path.resolve(__dirname, 'dist/dll/[name].manifest.json'),
      context: __dirname
    }),
  ],
}
