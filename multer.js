const multer = require("multer")
const fileValidation = {
    image: ['image/png', 'image/jpeg', 'image/jif','image/webp','video/mp4','image/jpg'],
    pdf: ['application/pdf'],
}
 const HME = (err, req, res, next) => {
    if (err) {
        res.json({ message: "multer error message", err: err });
    } else {
        next();
    }
};
 const myMulter = (customValidation = fileValidation.image) =>{
    const storage = multer.diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb('invalid format', false)
        }
    }
    const upload = multer({ fileFilter, storage })
    return upload
}
module.exports ={HME,myMulter,fileValidation}