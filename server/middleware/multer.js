const multer = require('multer');

const storage = multer.memoryStorage();
const extensions = ['image/png', 'image/svg', 'image/jpg', 'image/jpeg'];

const fileFilter = (req, file, cb) => {
    if (extensions.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

module.exports = upload;