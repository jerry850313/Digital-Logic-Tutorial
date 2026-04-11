const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index1.html'));
  });

router.get('/api/courses', (req, res) => {
    const categories = [
        {
            category: "數位積體電路 -- 楊博惠",
            lessons: [
                { name: "Chapter 01", url: "/數位積體電路--楊博惠/chapter01.pdf" },
                { name: "Chapter 02", url: "/數位積體電路--楊博惠/chapter02.pdf" },
                { name: "Chapter 03", url: "/數位積體電路--楊博惠/chapter03.pdf" },
                { name: "Chapter 04", url: "/數位積體電路--楊博惠/chapter04.pdf" },
                { name: "Chapter 05", url: "/數位積體電路--楊博惠/chapter05.pdf" },
                { name: "Chapter 06", url: "/數位積體電路--楊博惠/chapter06.pdf" },
                { name: "Chapter 07", url: "/數位積體電路--楊博惠/chapter07.pdf" },
                { name: "Chapter 08", url: "/數位積體電路--楊博惠/chapter08.pdf" },
                { name: "Std Cell Tanner AMI", url: "/數位積體電路--楊博惠/Std_Cell_Tanner_AMI.pdf" }
            ]
        },
        {
            category: "數位邏輯設計 -- 蘇慶龍",
            lessons: [
                { name: "Chapter 01", url: "/數位邏輯/國立雲林科技大學--蘇慶龍/Chap1.pdf" },
                { name: "Chapter 02", url: "/數位邏輯/國立雲林科技大學--蘇慶龍/Chap2.pdf" },
                { name: "Chapter 03", url: "/數位邏輯/國立雲林科技大學--蘇慶龍/Chap3.pdf" },
            ]
        },


        {
            category: "數位邏輯 -- 國立中央大學 謝易叡",
            lessons: [
                { name: "CH 1", url: "/數位邏輯/國立中央大學--謝易叡/CH1.pdf" },
                { name: "CH 2", url: "/數位邏輯/國立中央大學--謝易叡/CH2.pdf" },
                { name: "CH 3", url: "/數位邏輯/國立中央大學--謝易叡/CH3.pdf" },
                { name: "CH 4", url: "/數位邏輯/國立中央大學--謝易叡/CH4.pdf" },
                { name: "CH 5", url: "/數位邏輯/國立中央大學--謝易叡/CH5.pdf" },
                { name: "CH 7", url: "/數位邏輯/國立中央大學--謝易叡/CH7.pdf" },
                { name: "CH 8", url: "/數位邏輯/國立中央大學--謝易叡/CH8.pdf" },
                { name: "CH 9", url: "/數位邏輯/國立中央大學--謝易叡/CH9.pdf" },
                { name: "CH 10", url: "/數位邏輯/國立中央大學--謝易叡/CH10.pdf" },
                { name: "CH 11", url: "/數位邏輯/國立中央大學--謝易叡/CH11.pdf" },
                { name: "CH 12", url: "/數位邏輯/國立中央大學--謝易叡/CH12.pdf" },
                { name: "CH 13", url: "/數位邏輯/國立中央大學--謝易叡/CH13.pdf" }
            ]
        },
        {
            category: "數位邏輯 -- 清大 OCW",
            lessons: [
                { name: "CH 01", url: "/數位邏輯/清大ocw/CH01.pdf" },
                { name: "CH 02", url: "/數位邏輯/清大ocw/CH02.pdf" },
                { name: "CH 03", url: "/數位邏輯/清大ocw/CH03.pdf" },
                { name: "CH 04", url: "/數位邏輯/清大ocw/CH04.pdf" },
                { name: "CH 05", url: "/數位邏輯/清大ocw/CH05.pdf" },
                { name: "CH 06", url: "/數位邏輯/清大ocw/CH06.pdf" },
                { name: "CH 07", url: "/數位邏輯/清大ocw/CH07.pdf" },
                { name: "CH 08", url: "/數位邏輯/清大ocw/CH08.pdf" },
                { name: "CH 09", url: "/數位邏輯/清大ocw/CH09.pdf" },
                { name: "CH 10", url: "/數位邏輯/清大ocw/CH10.pdf" },
                { name: "CH 11", url: "/數位邏輯/清大ocw/CH11.pdf" },
                { name: "CH 12", url: "/數位邏輯/清大ocw/CH12.pdf" },
                { name: "CH 13", url: "/數位邏輯/清大ocw/CH13.pdf" },
                { name: "CH 14", url: "/數位邏輯/清大ocw/CH14.pdf" },
                { name: "CH 15", url: "/數位邏輯/清大ocw/CH15.pdf" }
            ]
        }
    ];
    res.json(categories);
});

module.exports = router;
