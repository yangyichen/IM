//自动生成雪碧图
let path = require('path');
let proUrl = process.env.NODE_ENV == 'production' ? '/travelbook' : '';
module.exports = {
  plugins: [
    require('postcss-sprites')({
      verbose: true,
      stylesheetPath: './src/css/', //目标文件读取的是css
      spritePath: path.resolve(__dirname, proUrl + '/dist/assets'), //雪碧图合并后存放地址
      spritesmith: {
        padding: 10
      }
    }),
    require('precss')({ /* ...options */ }),
    require('autoprefixer')({ /* ...options */ })
  ]
}