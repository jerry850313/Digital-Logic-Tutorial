const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const indexRouter = require('./routes/index');
const ansRouter = require('./routes/ans');

const app = express();

app.set('trust proxy', 1);

// ── 1. 極致安全與跨域設定 ───────────────────────────────────────
app.use(cors());

// 防爬蟲與自動化工具攔截器 (封鎖 wget, curl 等)
app.use((req, res, next) => {
    const ua = req.headers['user-agent'] || '';
    const forbiddenAgents = [/wget/i, /curl/i, /python/i, /libwww/i, /httpclient/i, /go-http/i];
    
    // 如果偵測到黑名單中的工具
    if (forbiddenAgents.some(agent => agent.test(ua))) {
        console.warn(`🚫 [Security] Blocked automated tool: ${ua} from IP: ${req.ip}`);
        return res.status(403).send('<h1>403 Forbidden</h1><p>Automated downloads are strictly prohibited on this server.</p>');
    }

    // 額外檢查：如果完全沒有 User-Agent (通常是腳本請求)
    if (!ua || ua.length < 10) {
        return res.status(403).send('Forbidden');
    }

    next();
});

// 隱藏伺服器指紋，防止探測
app.disable('x-powered-by');

// Helmet 安全標頭 (關閉會卡 UI 的功能，保留核心防護)
app.use(helmet({
  contentSecurityPolicy: false, // 不啟用 CSP，確保您的 CDN 與 inline script 不被擋
  hsts: false,                  // 本地與開發環境不強制 HTTPS
  crossOriginEmbedderPolicy: false, 
  crossOriginResourcePolicy: { policy: "cross-origin" }, // 允許跨來源資源
  frameguard: { action: 'deny' }, // 徹底禁止 iframe 嵌入 (防點擊劫持)
  noSniff: true, // 防 MIME 嗅探
  xssFilter: true, // 強化 XSS 防護
}));

// 全局流量清洗 (防 DDoS，每 1 分鐘最多 200 次請求)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: "流量異常，連接已被暫時封鎖。",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// 暴力破解絕對防禦 (驗證 API：1 小時內只能錯 5 次)
const strictAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: "【系統警告】驗證失敗次數過多，帳號或 IP 已被鎖定，請 1 小時後再試。",
});
app.use('/ans/api/verify', strictAuthLimiter);
app.use('/exam/api/verify', strictAuthLimiter);
app.use('/ans/api/config', strictAuthLimiter);

// ── 2. 日誌功能 ──────────────────────────────────────────
const logDir = path.join(__dirname, 'logs');
fs.mkdirSync(logDir, { recursive: true });
const logStream = rfs.createStream('access.log', { interval: '1d', path: logDir, compress: 'gzip', maxFiles: 30 });

// 淨化 IP：移除 ::ffff: 
morgan.token('real-ip', (req) => {
    let ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ?? req.ip;
    return ip.replace(/^.*:/, ''); 
});

// 記錄當前使用者 (由驗證中介軟體填入)
morgan.token('user', (req) => req.user?.username || 'Guest');

const logFormat = JSON.stringify({ 
    time: ':date[iso]', 
    ip: ':real-ip', 
    user: ':user',
    method: ':method', 
    url: ':url', 
    status: ':status', 
    ms: ':response-time' 
});
app.use(morgan(logFormat, { stream: logStream }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── 3. 解析器 ───────────────────────────────────────────
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// ── 4. 靜態資源 (最優先，防止 MIME Type 錯誤) ──────────────────
app.use('/javascripts', express.static(path.join(__dirname, 'public/javascripts')));
app.use('/stylesheets', express.static(path.join(__dirname, 'public/stylesheets')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/downloads', express.static(path.join(__dirname, 'public/downloads')));
app.use(express.static(path.join(__dirname, 'public')));

// 攔截器：考卷保護
app.use((req, res, next) => {
  const pathname = req.path;
  const filename = path.basename(pathname);
  if (pathname.endsWith('.html') && (filename.startsWith('exam') || filename.startsWith('quiz'))) {
    if (ansRouter && typeof ansRouter.checkAccess === 'function') {
      return ansRouter.checkAccess(req, res, next);
    }
  }
  next();
});

// ── 5. 路由管理 ──────────────────────────────────────────
app.use('/', indexRouter);

module.exports = app;
