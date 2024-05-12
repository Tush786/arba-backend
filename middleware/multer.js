const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationFolder = "./public";
        // Ensure destination folder exists
        fs.mkdirSync(destinationFolder, { recursive: true });
        cb(null, destinationFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Exporting the upload middleware
module.exports = multer({ storage });
