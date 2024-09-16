const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('courses');
  });

router.get('/api/courses', (req, res) => {
    const courses = [
        
    ];
    res.json(courses);
});

module.exports = router;
