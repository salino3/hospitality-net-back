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
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(
      new Error("Invalid file type. Only JPG, JPEG,WEBP and PNG are allowed."),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

// Upload for company
const storageCompany = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/logo_pictures/"); // Directory where images will be stored
  },
  filename: function (req, file, cb) {
    // To avoid filename collisions, use Date.now() or a unique identifier
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

// File filter to accept only images (optional)
const fileFilterCompany = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    return cb(
      new Error("Invalid file type. Only JPG, JPEG,WEBP and PNG are allowed."),
      false
    );
  }
};

const uploadCompany = multer({ storageCompany, fileFilterCompany });

// Custom upload
const customUpload = (route, prop) => {
  // Storage configuration
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${route}/`); // Directory where images will be stored
    },
    filename: function (req, file, cb) {
      // To avoid filename collisions, use Date.now() or a unique identifier
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    },
  });

  // File filter to accept only images (optional)
  const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      return cb(
        new Error(
          "Invalid file type. Only JPG, JPEG,WEBP and PNG are allowed."
        ),
        false
      );
    }
  };

  const upload = multer({ storage, fileFilter });

  return upload.single(`${prop}`);
};

module.exports = { upload, uploadCompany, customUpload };
