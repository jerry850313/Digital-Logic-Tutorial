const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const indexRouter = require('./routes/index');
const coursesRouter = require('./routes/courses');
const verilogRouter = require('./routes/verilog');
const examRouter = require('./routes/exam');

const app = express();

// 設置視圖引擎 (保留以利原有 pug 頁面)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// 解析 POST 請求
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 靜態檔案路徑：必須先對齊特殊路徑，再服務根目錄
app.use('/verilog_files', express.static(path.join(__dirname, 'public/verilog')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(express.static(path.join(__dirname, 'public')));

// 路由掛載
app.use('/', indexRouter);
app.use('/courses', coursesRouter);
app.use('/verilog', verilogRouter);
app.use('/exam', examRouter);

module.exports = app;
