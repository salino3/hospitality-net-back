const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile_pictures/"); // Directory where images will be stored
  },
  filename: function (req, file, cb) {
    // To avoid filename collisions, use Date.now() or a unique identifier
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// File filter to accept only images (optional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, JPEG and PNG are allowed."),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
