const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');

const indexRouter = require('./routes/index');
const coursesRouter = require('./routes/courses');
const verilogRouter = require('./routes/verilog');

const app = express();

// 設置視圖引擎和靜態文件目錄
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', indexRouter);
app.use('/courses', coursesRouter);
app.use('/verilog', verilogRouter);

module.exports = app;
