const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');
const app = express();
app.use(express.json());

const cors =require('cors')
app.use(cors())

app.use(helmet({
  crossOrigineResourcePolicy: false,
}));

// Configuration de l'entete de la requete
app.use((req,res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Connexion de la base de données 'mongoose' - Projet P7 - Clusterdp18
mongoose.connect(process.env.CONNEXION_MONGO,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Définie un emplacement static pour la gestion des images de sauce
app.use('/images', express.static(path.join(__dirname, 'images')));

// Définition des accés racine pour les routes Sauces et utilisateurs
app.use('/api/posts', postRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;