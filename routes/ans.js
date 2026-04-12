const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/api/list', (req, res) => {
    const data = [
        {
            category: "考試專區 (Exams)",
            items: [
                { name: "第一次期中考", url: "/exam1.html", date: "2024-04-15" },
                { name: "第二次期中考", url: "/exam2.html", date: "2024-05-20" },
                { name: "期末考", url: "/exam3.html", date: "2024-06-25" }
            ]
        },
        {
            category: "小考專區 (Quizzes)",
            items: [
                { name: "小考 1 (第一章 ~ 第二章)", url: "/quiz1.html", date: "2024-03-10" },
                { name: "小考 2 (第三章 ~ 第五章)", url: "/quiz2.html", date: "2024-04-05" },
                { name: "小考 3 (第六章 ~ 第八章)", url: "/quiz3.html", date: "2024-05-15" }
            ]
        }
    ];
    res.json(data);
});

module.exports = router;
