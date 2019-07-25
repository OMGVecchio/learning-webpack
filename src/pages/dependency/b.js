// import './d'
import(/* webpackChunkName: "d" */'./d')

async function test () {
  await Promise.resolve('ok')
}
test()

console.log('---b---')
