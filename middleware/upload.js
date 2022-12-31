const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png'||
    file.mimetype === 'video/mp4'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

const imageFilter = (req,file,cb) => {
    if (file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png') {
        cb(null,true);
    } else {
        cb(null,false);
    }
}

const uploadfile = multer({
    storage,
    limit: 25 * 1024 * 1024,
    fileFilter
});

const uploadImage = multer({
    storage,
    limit: 5 * 1024 * 1024,
    imageFilter
});

module.exports = {
    uploadfile,
    uploadImage
}

