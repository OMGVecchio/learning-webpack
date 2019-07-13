### v4 新特性

+ 局部除了安装 webpack 外，还需要安装 webpack-cli
+ CommonsChunkPlugin 被移除，webpack-config 新增 optimization.splitChunks[拆分代码] 和 optimization.runtimeChunk[提取入口的 runtime 代码]
+ webpack-config 新增 mode 必配字段，取值为 "development|production|none"，取值为 production 时会自动开启 UglifyJsPlugin 等系列功能
+ mini-css-extract-plugin 替代 extract-text-webpack-plugin。优势：异步加载；不重复编译，性能更好；更容易使用；缺点：不支持热更新，开发环境需要引入 css-hot-loader。开发环境使用 optimize-css-assets-webpack-plugin 压缩

### 提升构建性能

+ 保持 webpack、node 最新 LTS 版本
+ 解析：减少 resolve 的类目数量
+ 解析：不使用 symlinks ，可以设置 resolve.symlinks: false
+ 解析：使用自定义解析 plugins ，并且没有指定 context 信息，可以设置 resolve.cacheWithContext: false
+ 保持 chunk 不能太大，使用 splitChunks 进行代码分割
+ cache-loader 持久化缓存
+ DllPlugin 单独编译不频繁变更代码
+ parallel-webpack 允许编译工作在 worker 池中进行
+ thread-loader 将好资源的编译转到 worker pool 中
+ TS：在单独的进程中使用 fork-ts-checker-webpack-plugin 进行类型检查
+ TS：使用 ts-loader 时，设置 happyPackMode: true / transpileOnly: true
+ webpack-parallel-uglify-plugin：提升 JS 压缩速度。把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程，从而实现并发编译
+ happypack：并发编译提升 loader 解析速度

### 小结

+ babel-loader option 的 cacheDirectory 可开启缓存提升编译速速；添加 babel-loader 后开始正常的 import() 语法报错，需要在 .babelrc 的 plugins 中配置 @babel/plugin-syntax-dynamic-import；解决每个 babel 编译的文件都存在的辅助代码：把 @babel/plugin-transform-runtime 配置到 .babelrc 的 plugins 中，引入 @babel/runtime 依赖
+ ts-loader 开启 happypack 模式后，options 的 happyPackMode 必须设置为 true
+ 过多的 loader 和 plugin 会拖慢构建性能，本项目简单的小文件，增添了越来越多的性能提升功能，构建时间却一直上升

### TODO

+ webpack 配置文件引用 ts 时存在问题?
+ webpack 的 ts 配置不包含 devServer 属性？
+ 完成多页面入口配置
