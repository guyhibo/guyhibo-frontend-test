const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app){
//   app.use(
//     createProxyMiddleware('/api', {
//       target: 'https://api.makeyourpage.net/',
//       pathRewrite: {
//         '^/api':''
//       },
//       changeOrigin: true
//     })
//   )
};