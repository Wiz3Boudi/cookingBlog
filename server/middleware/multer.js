const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cd) => {
        cd(null, 'public/uploads');
    },
    filename: (req, file, cd) => {
        const uniqueName = Date.now() + '-' + Math.round(
            Math.random() * 1E9) + path.extname(file.originalname);
        cd(null, uniqueName);
    }
});

const fileFilter = (req, file, cd) => {
    if (file.mimetype.includes('image/')) {
        cd(null, true)
    } else {
        cd(('InvalidInput: Only image files are allowed!'), false)
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

module.exports = upload;