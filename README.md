### v4 新特性

+ 局部除了安装 `webpack` 外，还需要安装 `webpack-cli`
+ `CommonsChunkPlugin` 被移除，webpack 配置新增 `optimization.splitChunks`[拆分代码] 和 `optimization.runtimeChunk`[提取入口的 `runtime` 代码]
+ webpack 配置新增 `mode` 必配字段，取值为 `"development|production|none"`，取值为 `production` 时会自动开启 `UglifyJsPlugin` 等系列功能
+ `mini-css-extract-plugin` 替代 `extract-text-webpack-plugin`。优势：异步加载；不重复编译，性能更好；更容易使用；缺点：不支持热更新，开发环境需要引入 `css-hot-loader`。开发环境使用 `optimize-css-assets-webpack-plugin` 压缩

### 提升构建性能

#### 环境
+ 保持 webpack、node 最新 LTS 版本

### 解析
+ 减少 `resolve` 的类目数量
+ 不使用 `symlinks` ，可以设置 `resolve.symlinks: false`
+ 使用自定义解析 plugins ，并且没有指定 `context` 信息，可以设置 `resolve.cacheWithContext: false`

### plugins
+ `DllPlugin` 单独编译不频繁变更代码
+ `parallel-webpack` 允许编译工作在 worker 池中进行
+ `thread-loader` 将好资源的编译转到 worker pool 中
+ `ts-loader`，设置 `happyPackMode: true` 开启 happypack，设置 `transpileOnly: true` 再使用 `fork-ts-checker-webpack-plugin` 在单独的进程中进行类型检查
+ `webpack-parallel-uglify-plugin`：提升 JS 压缩速度。把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程，从而实现并发编译
+ `happypack`：并发编译提升 loader 解析速度

### 其它
+ `cache-loader` 做持久化缓存
+ 保持 chunk 不能太大，使用 `splitChunks` 进行代码分割

### 小结

#### babel-loader
+ `option.cacheDirectory=true` 可开启缓存提升编译速速
+ `import()` 语法报错，需要在 .babelrc 的 plugins 中配置 `@babel/plugin-syntax-dynamic-import`
+ 解决 babel 编译文件都添加共同辅助代码：引入 `@babel/runtime` 依赖，把 `@babel/plugin-transform-runtime` 配置到 .babelrc 的 plugins 中

#### ts-loader
+ 开启 `happypack` 模式后，必须设置 `options.happyPackMode=true`
+ 设置 `options.transpileOnly=true`，使 ts-loader 只进行编译操作；再加入 `fork-ts-checker-webpack-plugin` 在单独的进程中进行类型检查。可提高构建速度

### Dll
+ 使用 Dll 需要重新配置一份新的 `webpack.dll.config` 文件，`entry` 中引入所有需要单独提出来编译的静态资源，设置 `output.library`；然后再引入 `webpack.DllPlugin` 插件，`DllPlugin` 中 dll 暴露的对象名 `name` 要与其配置 `output.library` 一致
+ 新 `webpack.config` 配置文件的 `webpack.DllReferencePlugin` 中的 `context` 字段要与 `DllPlugin` 中的一致，`manifest` 为 `DllPlugin` 配置打包出的资源映射文件路径
+ 多个项目使用相同库时，也可采用此方式，引入相同 manifest.json 文件，实现项目资源共享
+ `Dll` 与 `webpack.external` 功能类似，但模块引入方式不同。external 在全局暴露对象，Dll 采用的 webpack 模块化。最开始以为两者是搭配使用的，所以额外配置了重复的 external 导致页面资源加载报错

### 其它
+ 过多的 loader 和 plugin 会拖慢构建性能，本项目简单的小文件，增添了越来越多的性能提升功能，构建时间却一直上升。所以得根据场景合理使用各个工具

### TODO

+ webpack 配置文件引用 ts 时存在问题?
+ webpack 的 ts 配置不包含 devServer 属性？
+ 完成多页面入口配置
