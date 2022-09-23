const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Si il y a une selection de fichier image => Définit l'emplacement de stockage des images
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },

  // Définition de l'extension en fonction de l'image sélectionnée
  filename: (req, file, callback) => {
    const name1 = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    const name2 = name1.replace('.' + extension, '_');

    // Téléchargement de l'image en lui attribuant un nom unique
    callback(null, name2 + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image');
