import glob from 'glob'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const files = glob.sync('src/pages/**')

const getPageDomain = (filepath: string) => (filepath.match(/(?<=src\/pages\/)[a-z]*/) || [])[0]

const getEntry = (files: string[]) => {
  const entryMap = {}
  files.forEach(file => {
    console.log(file)
    console.log(getPageDomain(file))
  })
}

const getHtmlTemplate = (files: string[]) => {
  return files.map(file => {
    return new HtmlWebpackPlugin({
      title: file,
      filename: `pages/${file}.html`,
      template: './src/index.html'
    })  
  })
}
