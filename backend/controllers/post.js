const Post = require('../models/Post');
const User = require('../models/User');
const fs = require('fs');
const { useReducer } = require('react');
//const bodyParser = require('body-parser')


// Ajoute un objet Post

exports.createPost = (req, res) => {
  // Version P6 d'origine
  //console.log(req.body)
  const postObject = req.body;


  User.findOne({ _id: req.auth.userId }).then((user) => {

    //console.log(postObject);

    // Avec Talend API
    //const postObject = req.body;

    // les 2 lignes ci-dessous sont inutiles
    // delete postObject._id;
    delete postObject.userId;

    // Création du formulaire de la sauce dans l'objet 'sauce'
    const post = new Post({
      ...postObject,
      user_id: req.auth.userId,
      last_name: user.last_name,
      first_name: user.first_name,

      // Version P6 d'origine
      image_url: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

      //Version Talend API pour * seulement indiquer l'image dans le formulaire *
      //imageUrl:postObject.imageUrl
    });

    post.save()
      .then(() => { res.status(201).json({ message: 'Post enregistré !' }) })
      .catch(error => { res.status(400).json({ error }) })
  })
  // Enregistrement du formulaire de la post

}

// Modification d'un objet Post
exports.modifyPost = (req, res) => {

  // Vérifie si une image a était sélectionnée et enregistrée avec un nom unique
  postObject = req.file ?
    {
      ...req.body,

      // Si oui, définit le nouvel Url avec le nom unique de l'image selectionnée
      image_url: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

      // Sinon, renseigne le formulaire sauf 'imageUrl'
    } : { ...req.body }

  //Vérifie si l'utilisateur corresponds à la requéte
  //if (req.body.userId != req.auth.userId) {
  console.log("PostObject.userId " + postObject.userId)
  console.log("req.auth.userId " + req.auth.userId)




  // Efface l'ancien fichier correspondant à l'image avant MAJ
  Post.findOne({ _id: req.params.id })
    .then((post) => {

      // Si oui, et si une image a été selectionnée ( ou même reselectionnée !)
      if (req.file !== undefined) {
        //Définit le nom du fichier correspondant, avec son Url avant MAJ
        const filename = post.image_url.split('/images/')[1];

        // Et l'efface pour ne pas laisser de fichier image inutile sur le serveur
        // ('Multer' à déjà sélectionné et enregistré sur le serveur, 
        // un autre nom fichier image correspondant avec un nom unique ... )
        fs.unlink(`images/${filename}`, () => {
        })
      }

      if (post.user_id !== req.auth.userId && req.auth.adminRole !== '2') {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        // Met à jour le formulaire
        Post.updateOne({ _id: req.params.id }, { ...postObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Post modifié!' }))
          .catch(error => res.status(401).json({ error }))
      }

    });



};


exports.likedNoLiked = (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {

      console.log(req.body.like);
      console.log(!post.usersLiked.includes(req.auth.userId));
      console.log(post.usersDisLiked);

      if (req.body.like == 1 && !post.usersLiked.includes(req.auth.userId)) {

        // Si l'utilisateur authentifié n'est pas contenu dans tableau 'usersLiked'
        // Et si like = 1 => Incrémente likes et ajoute l'utilisateur dans tableau 'usersLiked'
        Post.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.auth.userId } })
          .then(() => res.status(200).json({ message: "Incremente likes et ajoute un utilisateur qui aime !" }))
          .catch(error => res.status(400).json({ error }))
      } else {
        if (req.body.like == 1 && post.usersLiked.includes(req.auth.userId)) {

          // Si like = 0, et que l'utilisateur est dans le tableau 'usersLiked'
          Post.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId } })
            .then(() => { res.status(200).json({ message: "Décrément likes et enléve un utilisateur qui aime !" }) })
            .catch(error => res.status(400).json({ error }))
        }//Si user dislike, il faut qu'il nest ni liké ni disliké auparavant
        else if (req.body.like == 2 && !post.usersLiked.includes(req.auth.userId) && !post.usersDisLiked.includes(req.auth.userId)) {

          // Si l'utilisateur authentifié n'est pas contenu dans tableau 'usersDisLiked'
          // Et si like = 2 => Incrémente dislikes et ajoute l'utilisateur dans tableau 'usersDisLiked'
          Post.updateOne({ _id: req.params.id }, { $inc: { disLikes: 1 }, $push: { usersDisLiked: req.auth.userId } })
            .then(() => res.status(200).json({ message: "Incremente dislikes et ajoute un utilisateur qui aime pas !" }))
            .catch(error => res.status(400).json({ error }))
            .catch(error => res.status(400).json({ error }))
        } else {
          if (req.body.like == 2 && post.usersDisLiked.includes(req.auth.userId)) {
  
            // Si like = 0, et que l'utilisateur est dans le tableau 'usersLiked'
            Post.updateOne({ _id: req.params.id }, { $inc: { disLikes: -1 }, $pull: { usersDisLiked: req.auth.userId } })
              .then(() => { res.status(200).json({ message: "Décrément dislikes et enléve un utilisateur qui aime pas !" }) })
              .catch(error => res.status(400).json({ error }))
          }
          else{
            res.status(400).json({ message: "aucune action choisie" });
          }
        }
      }
    })
    .catch(error => res.status(400).json({ error }))
}

exports.likedNoLiked2 = (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {

      console.log(!post.usersDisliked.includes(req.auth.userId))
      //Si user like, il faut qu'il nest ni liké ni disliké auparavant
      if (req.body.like == 1 && !post.usersLiked.includes(req.auth.userId) && !post.usersDisLiked.includes(req.auth.userId)) {

        // Si l'utilisateur authentifié n'est pas contenu dans tableau 'usersLiked'
        // Et si like = 1 => Incrémente likes et ajoute l'utilisateur dans tableau 'usersLiked'
        Post.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.auth.userId } })
          .then(() => res.status(200).json({ message: "Incremente likes et ajoute un utilisateur qui aime !" }))
          .catch(error => res.status(400).json({ error }))
      } else {
        if (req.body.like == 1 && post.usersLiked.includes(req.auth.userId)) {

          // Si like = 0, et que l'utilisateur est dans le tableau 'usersLiked'
          Post.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId } })
            .then(() => { res.status(200).json({ message: "Décrément likes et enléve un utilisateur qui aime !" }) })
            .catch(error => res.status(400).json({ error }))
        }

        //Si user dislike, il faut qu'il nest ni liké ni disliké auparavant
        else if (req.body.like == 2 && !post.usersLiked.includes(req.auth.userId) && !post.usersDisLiked.includes(req.auth.userId)) {

          // Si l'utilisateur authentifié n'est pas contenu dans tableau 'usersDisLiked'
          // Et si like = 2 => Incrémente dislikes et ajoute l'utilisateur dans tableau 'usersDisLiked'
          Post.updateOne({ _id: req.params.id }, { $inc: { disLikes: 1 }, $push: { usersDisLiked: req.auth.userId } })
            .then(() => res.status(200).json({ message: "Incremente dislikes et ajoute un utilisateur qui aime pas !" }))
            .catch(error => res.status(400).json({ error }))
            .catch(error => res.status(400).json({ error }))
        } else {
          if (req.body.like == 2 && post.usersDisLiked.includes(req.auth.userId)) {
  
            // Si like = 0, et que l'utilisateur est dans le tableau 'usersLiked'
            Post.updateOne({ _id: req.params.id }, { $inc: { disLikes: -1 }, $pull: { usersDisLiked: req.auth.userId } })
              .then(() => { res.status(200).json({ message: "Décrément dislikes et enléve un utilisateur qui aime pas !" }) })
              .catch(error => res.status(400).json({ error }))
          }
          else{
            res.status(400).json({ message: "aucune action choisie" });
          }
        }
      }
    })
    .catch(error => res.status(400).json({ error }))
}

// Suppression objet Post
exports.deletePost = (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then(post => {
      if (post.user_id !== req.auth.userId && req.auth.adminRole !== '2') {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = post.image_url.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Post.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Post supprimé !' }))
            .catch(error => res.status(400).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
}

// Lecture d'un objet Post
exports.getOnePost = (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => res.status(200).json(post))
    .catch(error => res.status(404).json({ error }));
}

// Lecture de tous les objets Post
exports.getAllPosts = (req, res) => {
  Post.find().sort({ _id: -1 })
    .then((post) => res.status(200).json(post))
    .catch(error => res.status(404).json({ error }));
}

// Lecture de tous les objets Post du user
exports.getAllPostsUser = (req, res) => {
  //console.log("ggfgfgfg");
  Post.find({ user_id: req.auth.userId }).sort({ _id: -1 })
    .then((post) => res.status(200).json(post))
    .catch(error => res.status(404).json({ error }));
}
