const fs = require("fs");

const errorImage = (profile_picture) => {
  if (profile_picture) {
    fs.unlink(profile_picture, (unlinkErr) => {
      if (unlinkErr) {
        console.error("Error deleting the image:", unlinkErr);
      } else {
        console.log("The image was deleted successfully");
      }
    });
  }
};

module.exports = { errorImage };
