<template>
    <section class="row d-flex flex-column" v-if="accedAccount">
        <v-col cols="12" class="d-sr-only">
            <h2 class="text-center mx-auto text-body-1 text-sm-h5">Voici la liste de tous les posts du forum Groupomania
                :</h2>
        </v-col>
        <!-- SI PAS DE POSTS -->
        <v-col v-if="postsNumber === 0">
            <p class="text-center mx-auto my-15 text-h5 text-sm-h4">Le forum est vide !</p>
        </v-col>
        <!-- POSTS -->
        <article class="col-12 mt-3" v-for="post in posts" :key="post._id">
            <v-card width="600" class="mx-auto rounded-lg">
                <v-list-item class="px-0 py-0">
                    <v-list-item-content class="px-0 py-0">
                        <!-- LIGNE 1 -->
                        <div v-if="sessionUserId === post.user_id || sessionUserRole === '2'">
                            <div class="px-5 py-1">
                                <v-card-actions class="d-flex justify-space-between align-center">
                                    <v-btn color="red" aria-label="Modifier mon post"
                                        @click.stop="dialogUpdatePostUp(post.title, post.description, post.image_url, post._id)"
                                        v-if="sessionUserId === post.user_id || sessionUserRole === '2'">
                                        <v-icon>mdi-file-document-edit</v-icon>
                                        <span class="ml-1 d-none d-sm-inline">Modifier</span>
                                    </v-btn>
                                    <v-btn color="red" aria-label="Supprimer mon post" @click="deletePost(post._id)"
                                        v-if="sessionUserId === post.user_id || sessionUserRole === '2'">
                                        <v-icon>mdi-delete</v-icon>
                                        <span class="ml-1 d-none d-sm-inline">Supprimer</span>
                                    </v-btn>
                                </v-card-actions>
                            </div>
                            <v-divider class="red lighten-4 mb-1"></v-divider>
                        </div>
                        <!-- LIGNE 2 -->
                        <div class="px-5 py-1 text-overline">
                            Publi?? par {{ post.first_name }} {{ post.last_name }} | Le {{
                            formatCreationDate(post.creation_date) }}
                        </div>
                        <v-divider class="red lighten-4 mb-3"></v-divider>
                        <!-- LIGNE 3 -->
                        <!--<router-link class="router-link black--text"
                            :to="{ name : 'OnePost', params: { id: post._id }}">
                            <h3 class="px-5 py-2 text-h5">{{ post.title }}</h3>
                            <div class="px-5 py-2">{{ post.description }}</div>
                            <div class="px-5 pt-3 pb-5 d-flex justify-center">
                                <v-img :src="post.image_url" contain width="200"
                                    :alt="getImageAlt(post._id, post.image_url)" />
                            </div>
                        </router-link>-->
                        <h3 class="px-5 py-2 text-h5">{{ post.title }}</h3>
                            <div class="px-5 py-2">{{ post.description }}</div>
                            <div class="px-5 pt-3 pb-5 d-flex justify-center">
                                <v-img :src="post.image_url" contain width="200"
                                    :alt="getImageAlt(post._id, post.image_url)" />
                            </div>
                        <v-divider class="mb-0 red lighten-4"></v-divider>
                        <!-- LIGNE 4 -->
                        <div class="d-flex flex-md-row align-center mb-1">
                            
                            <v-divider vertical class="red lighten-4"></v-divider>
                            <likeDislike v-bind:postId="post._id" ></likeDislike>
                            
                            <v-divider vertical class="red lighten-4 ml-4"></v-divider>
                            <!--<div class="px-2 text-body-1">
                                <v-icon class="d-inline d-sm-none">mdi-comment</v-icon>
                                <span class="d-none d-sm-inline">Commentaires </span>
                                ({{post.commentsNumber}})
                            </div>-->
                        </div>

                    </v-list-item-content>
                </v-list-item>
            </v-card>
        </article>
        <!-- DIALOGUE DE MODIFICATION DE POST -->
        <v-dialog v-model="dialogUpdatePost" persistent max-width="600px">
            <v-card>
                <v-card-title class="d-flex justify-center">
                    <span class="text-h5 mb-2">Modifier votre post</span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="form" v-model="valid">
                        <v-text-field v-model="title" ref="title" :rules="titleRules" counter="70"
                            label="Titre du post (*)" type="text" prepend-icon="mdi-format-title" color="black" outlined
                            clearable clear-icon="mdi-eraser" auto-grow></v-text-field>
                        <v-textarea v-model="description" ref="description" :rules="descriptionRules" counter="320"
                            label="Description du post (*)" type="text" prepend-icon="mdi-text" color="black" outlined
                            clearable clear-icon="mdi-eraser" auto-grow></v-textarea>
                        <v-file-input v-model="image" ref="image" :rules="imageRules" accept="image/*"
                            label="Image du post" type="file" filled prepend-icon="mdi-camera" show-size color="black">
                        </v-file-input>
                    </v-form>
                    <small>Champs requis (*)</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" aria-label="Annuler la modification du post" text
                        @click="dialogUpdatePost = false">
                        Annuler
                    </v-btn>
                    <v-btn color="green darken-1" aria-label="Valider la modification du post" text :disabled="!valid"
                        @click="updatePost()">
                        Valider
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </section>
</template>

<script>
import axios from 'axios'
import jwt from "jsonwebtoken"
import likeDislike from './likeDislike.vue'

export default {
    name: "Posts",
    components: {
        likeDislike,
       
    },
    data() {
        return {
            //Par d??faut
            accedAccount: false, // Acc??s non autoris?? ?? cette page
            sessionUserId: 0,
            sessionUserRole: 0,
            posts: [],
            postsNumber: 0,
            dialogUpdatePost: false,
            valid: true,
            title: '',
            postId: '',
            titleRules: [
                v => /^[A-Za-z\d\s????????????????????????????????????????????????&!-',:]{2,70}$/.test(v) || "Titre incorrect !",
                v => v.length <= 70 || '70 caract??res maximum !',
            ],
            description: '',
            descriptionRules: [
                v => /^[a-zA-Z\d\s????????????????????????????????????????????????&-_',!?:""????.]{10,320}$/.test(v) || "Description incorrect !",
                v => v.length <= 320 || '320 caract??res maximum !',
            ],
            image: '',
            imageRules: [
                value => !value || value.size < 3000000 || "L'image ne doit pas d??passer 3 MB !",
            ],
        }
    },
    created() {
        // V??rifier que l'utilisateur est bien connect?? avant d'avoir acc??s ?? cette page
        this.connectedUser()
    },
    beforeMount() {
        // Si l'utilisateur a acc??s ?? cette page (est connect??)
        if (this.accedAccount === true) {
            const token = JSON.parse(localStorage.user).token; // R??cup??rer le token du localStorage
            let decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET"); // D??coder ce token en le v??rifiant
            this.sessionUserId = decodedToken.userId; // l'ID de l'user pour la session = l'user Id d??cod??
            this.sessionUserRole = decodedToken.adminRole; // le r??le de l'user pour la session = le r??le admin d??cod??
            //alert(this.sessionUserRole);
            this.getAllPosts();
        }
    },
    methods: {
        connectedUser() {
            // Si l'user n'est pas stock?? dans le localStorage
            if (localStorage.user === undefined) {
                this.accedAccount = false;
                console.log("Acc??s non autoris?? !")
            } else { // Si l'user est bien stock?? dans le localStorage
                this.accedAccount = true;
                console.log("Acc??s autoris?? ?? l'utilisateur !");
                const user = JSON.parse(localStorage.getItem("user"));
                user
            }
        },
        getAllPosts() {
            const token = JSON.parse(localStorage.user).token;
            axios.get("http://localhost:3000/api/posts", {
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    this.posts = res.data; // Tous les posts
                    //console.log("getAllposts liste des posts:" )
                    //console.log(this.posts)
                    this.postsNumber = res.data.length;
                    //console.log("Tous les posts (" + this.postsNumber + ") s'affichent !");
                })
        },
        getImageAlt(postId, postImageURL) {
            //this.posts.id = postId;
            // R??cup??rer le nom de l'image qui sera le texte alternatif
            this.posts.image_url = postImageURL;

            //console.log("affichage this.posts.id dans getImageAlt: "+this.posts.id);
            if (postImageURL !== "") {
                const lastUnderscore = postImageURL.lastIndexOf("_");
                const lastSlash = postImageURL.lastIndexOf("/") + 1;
                const imageAlt = postImageURL.slice(lastSlash, lastUnderscore).split("_").join(" ");
                return imageAlt
            }
            
        },
        dialogUpdatePostUp(postTitle, postDescription, postImageUrl, postId) {
            // R??cup??rer les anciennes donn??es du post
            //console.log("POSTID A MODIFIER "+postId);
            
            /*this.posts.title = postTitle;
            this.posts.description = postDescription;
            this.posts.image_url = postImageUrl;
            this.posts.id = postId;*/

            //console.log("POSTID A MODIFIER 2 "+this.posts.id);
            // Activer la bo??te de dialogue
            this.dialogUpdatePost = true;
            // Afficher les anciennes donn??es du post
            this.title = postTitle
            this.description = postDescription;
            this.image = postImageUrl;
            this.postId = postId;
            //console.log("affichage this.posts.id dans dialogUpdatePostUp: "+this.posts.id);

           // console.log(this.posts);
        },
        updatePost() {
            // Les donn??es n??cessaires
            const postId = this.postId;
            //console.log("POSTID A MODIFIER 3 "+postId);
            const token = JSON.parse(localStorage.user).token;
            //Les donn??es ?? envoyer
            //const userId = this.posts.user_id;
            const title = this.title;
            const description = this.description;
            const image = this.image;

            // R??cup??rer l'extension de l'image quand il y en a une
            if (image !== "") {
                var fileName = image.name;
                var lastDot = fileName.lastIndexOf(".") + 1;
                var extensionFile = fileName.slice(lastDot, fileName.length).toLowerCase();
            }

            if (extensionFile == "gif" || extensionFile == "png" || extensionFile == "jpg" || extensionFile == "jpeg" || image === undefined || image === "") {
                const formDataPost = new FormData();
                // Ajouter des nouvelles paires cl??/valeur
                formDataPost.append("postId", postId);
                //formDataPost.append("userId", userId);
                formDataPost.append("title", title);
                formDataPost.append("description", description);
                formDataPost.append("image", image);

                for (var pair of formDataPost.entries()) {
                    console.log(pair[0] + ', ' + pair[1]);
                }

                axios.put(`http://localhost:3000/api/posts/${postId}`,
                    // Donn??es ?? envoyer
                    formDataPost
                    ,
                    // En-t??tes de requ??te
                    {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        }
                    })

                    .then(res => {
                        if (res.status === 200) {
                            alert(res.data.message);
                            this.dialogUpdatePost = false;
                            location.reload()
                        }
                    })
                    .catch(error => {
                        console.log(error.response.data.error);
                        alert(error.response.data.error);
                        setTimeout(function () { location.reload() }, 60000)
                    });
            } else {
                alert("??? Attention\nSeules les images au format GIF sont autoris??es !")
            }
        },
        deletePost(id) {
            const postId = id;
            const token = JSON.parse(localStorage.user).token;
            axios.delete(`http://localhost:3000/api/posts/${postId}`, { headers: { Authorization: 'Bearer ' + token } })
                .then((res) => {

                    //console.log("jhhjh")
                    if (res.status === 200) {
                        alert(res.data.message);
                        location.reload()
                    }
                })
                .catch(error => {
                    console.log(error.response.data.error);
                    alert(error.response.data.error);
                })
        },
        formatCreationDate(date) {            
            const event = new Date(date);          
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            return event.toLocaleDateString('fr-FR', options); // Ex: 26 juillet 2021, 16:37
        }
    },
}
</script>

<style lang="scss">
.btn-opinion {
    pointer-events: none;
}
</style>