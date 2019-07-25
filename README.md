### v4 新特性

+ 局部除了安装 `webpack` 外，还需要安装 `webpack-cli`
+ `CommonsChunkPlugin` 被移除，webpack 配置新增 `optimization.splitChunks`[拆分代码] 和 `optimization.runtimeChunk`[提取入口的 `runtime` 代码]
+ webpack 配置新增 `mode` 必配字段，取值为 `"development|production|none"`，取值为 `production` 时会自动开启 `UglifyJsPlugin` 等系列功能
+ `mini-css-extract-plugin` 替代 `extract-text-webpack-plugin`。优势：异步加载；不重复编译，性能更好；更容易使用；缺点：不支持热更新，开发环境需要引入 `css-hot-loader`。开发环境使用 `optimize-css-assets-webpack-plugin` 压缩

### 提升构建性能

#### 环境
+ 保持 webpack、node 最新 LTS 版本

#### 解析
+ 减少 `resolve` 的类目数量
+ 不使用 `symlinks` ，可以设置 `resolve.symlinks: false`
+ 使用自定义解析 plugins ，并且没有指定 `context` 信息，可以设置 `resolve.cacheWithContext: false`

#### plugins
+ `DllPlugin` 单独编译不频繁变更代码
+ `parallel-webpack` 允许编译工作在 worker 池中进行
+ `thread-loader` 将好资源的编译转到 worker pool 中
+ `ts-loader`，设置 `happyPackMode: true` 开启 happypack，设置 `transpileOnly: true` 再使用 `fork-ts-checker-webpack-plugin` 在单独的进程中进行类型检查
+ `webpack-parallel-uglify-plugin`：提升 JS 压缩速度。把任务分解给多个子进程去并发的执行，子进程处理完后再把结果发送给主进程，从而实现并发编译
+ `happypack`：并发编译提升 loader 解析速度

#### 其它
+ `cache-loader` 做持久化缓存
+ 保持 chunk 不能太大，使用 `splitChunks` 进行代码分割
+ webpack.config 的配置有一项 recordsPath，配置后打包时自动生成一份 JSON 文件，每次构建都是基于上次构建的基础上进行

### 小结

#### babel-loader
+ `option.cacheDirectory=true` 可开启缓存提升编译速速
+ `import()` 语法报错，需要在 .babelrc 的 plugins 中配置 `@babel/plugin-syntax-dynamic-import`
+ 解决 babel 编译文件都添加共同辅助代码：引入 `@babel/runtime` 依赖，把 `@babel/plugin-transform-runtime` 配置到 .babelrc 的 plugins 中

#### ts-loader
+ 开启 `happypack` 模式后，必须设置 `options.happyPackMode=true`
+ 设置 `options.transpileOnly=true`，使 ts-loader 只进行编译操作；再加入 `fork-ts-checker-webpack-plugin` 在单独的进程中进行类型检查。可提高构建速度

#### Dll
+ 使用 Dll 需要重新配置一份新的 `webpack.dll.config` 文件，`entry` 中引入所有需要单独提出来编译的静态资源，设置 `output.library`；然后再引入 `webpack.DllPlugin` 插件，`DllPlugin` 中 dll 暴露的对象名 `name` 要与其配置 `output.library` 一致
+ 新 `webpack.config` 配置文件的 `webpack.DllReferencePlugin` 中的 `context` 字段要与 `DllPlugin` 中的一致，`manifest` 为 `DllPlugin` 配置打包出的资源映射文件路径
+ 多个项目使用相同库时，也可采用此方式，引入相同 manifest.json 文件，实现项目资源共享
+ `Dll` 与 `webpack.external` 功能类似，但模块引入方式不同。external 在全局暴露对象，Dll 采用的 webpack 模块化。最开始以为两者是搭配使用的，所以额外配置了重复的 external 导致页面资源加载报错

#### vender 缓存
+ 在 `vender_[chunkhash].bundle.js` 第三方资源均为改动的情况下，其它文件修改后的重新打包可能导致 `vender_[chunkhash].bundle.js` 的 `chunkhash` 改变，因为 webpack 用自增的数字作为每一个模块的 ID[`module.id`]，添加其它模块导致 vender 里的 `moduleId` 变化，最终会导致 vender chunkhash 的变化
+ 解决 vender chunkhash 变化的方法：添加 `webpack.NamedChunksPlugin` 把 `chunkId` 变为固定的字符串标识；`HashedModuleIdsPlugin` 根据模块相对路径生成的 hash 作为标识，此比 `NamedChunksPlugin` 生成的字符串更少，适合用于线上；直接用其他 vender 缓存方式，比如 external，dll 等
+ 在最近版本的 webpack 中，我尝试通过新增模块试图来改变 `vender_[chunkhash]`，但是结果与上面的描述不同，`chunkhash` 并没有变化，是最新的 webpack 完善了此功能？在构建完成后的文件中，发现 `module.id` 应该默认已经切换成模块文件路径

#### 其它
+ 过多的 loader 和 plugin 会拖慢构建性能，本项目简单的小文件，增添了越来越多的性能提升功能，构建时间却一直上升。所以得根据场景合理使用各个工具

### babel
+ babel 7：包名变化（把所有 babel-* 重命名为 @babel/*），不支持低版本 node（>=6）
+ `@babel/core`：把 JS 代码抽象成 AST 树；然后再将 plugins 转译好的内容解析为 JS 代码
+ `@babel/cli`：JS 文件转换工具
+ `@babel/node`：@babel/cli 的一部分，它使 ES6+ 可以直接运行在 node 环境中
+ plugins 与 presets 同时存在的执行顺序
```
1. 先执行 plugins 的配置项，再执行 Preset 的配置项
2. plugins 配置项，按照声明顺序执行
3. Preset 配置项，按照声明逆序执
```

#### 平台兼容代码配置

+ babel 对一些新的 API 是无法转换，比如 Generator、Set、Proxy、Promise 等全局对象，以及新增的一些方法：includes、Array.form 等。所以这个时候就需要一些工具来为浏览器做这个兼容

##### @babel/polyfill(内部集成了 core-js 和 regenerator)
+ 将所有的补丁工具函数一起打包出来，会导致最终的包体积很大，而且会存在很多不需要的代码
+ 并且这是在全局变量上的补丁，对很多原型链进行了修改，某些场景下对项目来说是有利的，但也增加不小的不可控因素

##### @babel/runtime(内部集成了 core-js 和 regenerator 等) & @babel/plugin-transform-runtime
+ `@babel/runtime` 能在每个模块中重写一些浏览器不能支持的函数，但是所有模块文件都会添加额外的工具函数代码，大大增加了代码的体积
+ `@babel/plugin-transform-runtime` 会提取公共使用的工具函数，然后在每个模块中引入，可以减小 `@babel/runtime` 编译后的代码体积
+ 由于采用了沙盒机制，这种做法不会污染全局变量，也不会去修改内建类的原型

##### @babel/present-env(开启 useBuiltIns)
+ 开启 `useBuiltIns`，需要额外引入 `@babel/polyfill` 模块，且只能被引入一次，如果多次引入会造成全局作用域的冲突。例如入口文件 `import '@babel/polyfill`
+ babel 能自动给每个文件添加其需要的 polyfill，最终将引入的 `@babel/polyfill` 自动替换为所需的 polyfill，实现按需打包
+ `useBuiltIns` 参数说明
```
1. false: 不对 polyfills 做任何操作
2. entry: 根据 target 中浏览器版本的支持，将 polyfills 拆分引入，仅引入有浏览器不支持的 polyfill
3. usage(新)：检测代码中 ES6/7/8 等的使用情况，仅仅加载代码中用到的 polyfills
```

### TODO

+ webpack 配置文件引用 ts 时存在问题?
+ webpack 的 ts 配置不包含 devServer 属性？
+ 完成多页面入口配置
