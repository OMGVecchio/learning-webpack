### v4

+ 布局除了安装 webpack 外，还需要安装 webpack-cli
+ CommonsChunkPlugin 被移除，webpack-config 新增 optimization.splitChunks 和 optimization.runtimeChunk
+ webpack-config 新增 mode 必配字段，取值为 "development|production|none"

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

### TODO

+ webpack 配置文件引用 ts 时存在问题?
+ webpack 的 ts 配置不包含 devServer 属性？
+ 完成多页面入口配置
