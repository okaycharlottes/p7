const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Lecture d'un objet User
exports.getOneUser = (req, res) => {
    User.findOne({ _id: req.params.id })
        .then((user) => res.status(200).json(user))
        .catch(error => res.status(404).json({ error }));
}


// Suppression objet User
exports.deleteUser = (req, res) => {
    User.findOne({ _id: req.auth.userId })
        .then(user => {

            //console.log(user._id.toString())
            //console.log(req.auth.userId)
            if (user._id != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                /*const filename = post.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                  Post.deleteOne({ _id: req.params.id })
                    .then(() => res.status(204).json({ message: 'Post supprimé !' }))
                    .catch(error => res.status(400).json({ error }));
                });*/

                User.deleteOne({ _id: req.auth.userId })
                    .then(() => {
                        Post.deleteMany({ user_id: req.auth.userId })
                            .then(() => res.status(200).json({ message: 'Le User et ses post(s) supprimé(s) !' }))
                            .catch(error => res.status(400).json({ error }));
                        //res.status(204).json({ message: 'User supprimé !' })
                    })
                    .catch(error => {
                        
                        //console.log(error);
                        res.status(400).json({ error })});
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
}


exports.signup = (req, res) => {

    const typeuser = "Admin"
    // Cryptage du mot de passe, unidirectionnel ( méthode hash')
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                last_name: req.body.lastName,
                first_name: req.body.firstName,
                email: req.body.email,
                password: hash,
                //admin_role: typeuser
            });

            // Sauvegarde l'email de l'utilisateur avec le mot de passe crypté
            user.save()
                .then(() => res.status(201).json({
                    userId: user._id,
                    token: jwt.sign(
                        { userId: user._id, adminRole: user.admin_role },
                        `${process.env.TOKEN_SECRET}`,
                        { expiresIn: '24h' }
                    ), message: 'Utilisateur créé'
                }))
                .catch(error => res.status(401).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res) => {
    User.findOne({ email: req.body.email })

        // Vérifie si l'email de l'utilisateur n'existe pas déjà
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé !' });
            }

            // Décryptage du mot de passe pour authentification
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }

                    // Si mot le passe authentifié => Définit un token utilisateur à partir de la variable d'environnement 
                    // et limite sa validité à 24h
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id, adminRole: user.admin_role  },  
                            `${process.env.TOKEN_SECRET}`,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error })
                );
        })
        .catch(error => res.status(500).json({ error }));
};