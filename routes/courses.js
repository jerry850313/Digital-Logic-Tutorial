const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('courses');
  });

router.get('/api/courses', (req, res) => {
    const courses = [
        { name: "Course 01", url: "https://drive.google.com/file/d/1WLDWfqX90e_flawFNvrxYUemDz-uG3Zg/view?usp=drive_link" },
        { name: "Course 02", url: "https://drive.google.com/file/d/1Xi12JoXvTU0huwL6CRp7HsKhjnDvXFhQ/view?usp=drive_link" },
        { name: "Course 03", url: "https://drive.google.com/file/d/1lz1p2S613lu-Gb0mynskWhkd7uoD-osA/view?usp=drive_link" },
        { name: "Course 04", url: "https://drive.google.com/file/d/1BO5OJsd37bvk9sDVWriSAWk8hN8mQZxS/view?usp=drive_link" },
        { name: "Course 05", url: "https://drive.google.com/file/d/1uZyPVyNa_jeHyWFLeL6_427pNX2D3O58/view?usp=drive_link" },
        { name: "Course 07", url: "https://drive.google.com/file/d/1IWIZelaZx2s45Odqc6QfNkAVIuOIex6F/view?usp=drive_link" },
        { name: "Course 08", url: "https://drive.google.com/file/d/1pYMbkv5qD-C420UfqG9eOWkCQQOnF-QY/view?usp=drive_link" },
        { name: "Course 09", url: "https://drive.google.com/file/d/1zY0CyLzhHRO-Ymn4ArMt20xT9z_NhiEQ/view?usp=drive_link" },
        { name: "Course 10", url: "https://drive.google.com/file/d/1GidBxgr-u5nxHBci9GyTQUDW6kQXRZ-O/view?usp=drive_link" },
        { name: "Course 11", url: "https://drive.google.com/file/d/1x0YbAtauPFbvRiG4WjAQGx1zNZOgdAFG/view?usp=drive_link" },
        { name: "Course 12", url: "https://drive.google.com/file/d/1AsbTrULLZXtFQcgVr3qCxPWGfXkKi6uD/view?usp=drive_link" },
        { name: "Course 13", url: "https://drive.google.com/file/d/1VhwN7A5wY25vS1Zu1Kwe2LNlVyHD3896/view?usp=drive_link" }
    ];
    res.json(courses);
});

module.exports = router;
