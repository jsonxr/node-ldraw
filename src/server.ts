import express from 'express'
import morgan from 'morgan';
import pkg from 'http-proxy-middleware';
import cors from 'cors';

const { createProxyMiddleware } = pkg;

// Creat Express Server
const app = express();

app.use(cors())
app.use(express.static('./'))

// Confiugration
const PORT = 8000;
const HOST = "localhost";
// Request URL: http://omr.ldraw.org/static/ldraw/parts/3024.dat
const LDRAW_URL = 'http://omr.ldraw.org/static';


app.use(morgan('dev'));

app.get('/', (req, res, next) => {
  res.send('Test');
})

app.use('/ldraw', createProxyMiddleware({ target: LDRAW_URL, changeOrigin: true}));
app.use('/media', createProxyMiddleware({ target: 'http://omr.ldraw.org', changeOrigin: true }))

app.listen(PORT, HOST, () => {
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
});