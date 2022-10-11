<template>
    <div>
        <!-- LIGNE 4 -->
        <div class="d-flex flex-md-row align-center mb-1">
            <div class="px-2 text-body-1">
                <v-btn  :disabled="disabledLike == 0" text icon aria-label="Liker ce post" :color="likeColor.color" @click="modifyLike()">
                    <v-icon>mdi-thumb-up</v-icon>
                </v-btn>
                {{ post.likes }}
            </div>
            <v-divider vertical class="red lighten-4"></v-divider>
            <div class="pl-2 text-body-1">
                <v-btn  :disabled="disabledDisLike == 0" text icon aria-label="Disliker ce post" :color="dislikeColor.color" @click="modifyDislike()">
                    <v-icon>mdi-thumb-down</v-icon>
                </v-btn>
                {{ post.disLikes }}
            </div>
            
        </div>
    </div>                                   
</template>

<script>
//import HeaderLogged from '../components/HeaderLogged.vue'
//import PostsNav from '../components/PostsNav.vue'
//import { getCurrentInstance } from 'vue';
import jwt from "jsonwebtoken"
import axios from 'axios'
//import { ref } from 'vue';

export default {
    name: "LikeDislike",
    props: ['postId'],
    data() {
        return {
            //Par défaut
            //disabled: "",
            
            accedAccount: false, // Accès non autorisé à cette page
            sessionUserId: 0,
            sessionUserRole: 0,
            post: [],
            //imageAlt: "",
            //comments: [],
            likeColor: [],
            dislikeColor: [],
            //dialogUpdatePost: false,
            //dialogUpdateComment: false,
            valid: true,
            //like: 0,
            disabledLike: 0,
            disabledDisLike : 0,

            componentKey: 0,
           
        }
    },
    created(){
        // Vérifier que l'utilisateur est bien connecté avant d'avoir accès à cette page
        this.connectedUser()
    },
    beforeMount() {
        // Si l'utilisateur a accès à cette page (est connecté)
        if (this.accedAccount === true) {
            const token = JSON.parse(localStorage.user).token; // Récupèrer le token du localStorage
            let decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET"); // Décoder ce token en le vérifiant
            this.sessionUserId = decodedToken.userId; // l'ID de l'user pour la session = l'user Id décodé
            this.sessionUserRole = decodedToken.adminRole; // le rôle de l'user pour la session = le rôle admin décodé
            this.getOnePost();
            //this.getComments();
        }
    },
    methods: {
        connectedUser(){
            // Si l'user n'est pas stocké dans le localStorage
            if (localStorage.user == undefined){
                this.accedAccount = false;
                console.log("Accès non autorisé !")
            } else { // Si l'user est bien stocké dans le localStorage
                this.accedAccount = true;
                console.log("Accès autorisé à l'utilisateur !");
            }
        },
        getOnePost(){
            //alert(this.postId);
            const postId = this.postId;
            const userId = this.sessionUserId;
            const token = JSON.parse(localStorage.user).token;
            
            axios.get(`http://localhost:3000/api/posts/${postId}`, {headers: {Authorization: 'Bearer ' + token}})
            .then(res => {
                
                if (res.data === undefined){
                    this.post = [];
                } else {
                    this.post = res.data; // Le post

                    //Pas de Like pas de Dislike
                    if(!this.post.usersLiked.includes(userId) && !this.post.usersDisLiked.includes(userId) ){
                        this.likeColor = { color: "green lighten-2" };
                        this.dislikeColor = { color: "red lighten-3" };
                        this.disabledLike = 1;
                        this.disabledDisLike = 1;
                    }
                    //Post liké
                    else if(this.post.usersLiked.includes(userId)){
                        this.likeColor = { color: "green darken-2" };
                        this.dislikeColor = { color: "red lighten-3" };
                        this.disabledLike = 1;
                        this.disabledDisLike = 0;
                    }
                    //Post Disliké
                    else if(this.post.usersDisLiked.includes(userId)){
                        this.likeColor = { color: "green lighten-2" };
                        this.dislikeColor = { color: "red darken-3" };
                        this.disabledLike = 0;
                        this.disabledDisLike = 1;
                    }

                    /*if(this.post.opinion === null || this.post.opinion === 1) {// Pas d'opinion OU opinion annulée
                        this.likeColor = { color: "green lighten-2" };
                        this.dislikeColor = { color: "red lighten-3" };
                    }
                    if(this.post.opinion === 2) {// Post liké
                        this.likeColor = { color: "green darken-2" };
                        this.dislikeColor = { color: "red lighten-3" };
                    }
                    if(this.post.opinion === -2) {// Post disliké
                        this.likeColor = { color: "green lighten-2" };
                        this.dislikeColor = { color: "red accent-4" };
                    }*/
                   
                    //console.log("likeDislike affichage du post:" )
                    //console.log(this.post)
                   
                   
                    //console.log("Le post " + this.post._id + " est bien affiché !");

                    // Récupérer le nom de l'image qui sera le texte alternatif
                    /*const image = this.post.image_url;
                    const lastUnderscore = image.lastIndexOf("_");
                    const lastSlash = image.lastIndexOf("/") + 1;
                    this.imageAlt = image.slice(lastSlash, lastUnderscore).split("_").join(" ");*/
                }
            })
        },        
        modifyLike(){
            const token = JSON.parse(localStorage.user).token;
            //Récupérer les données du post à envoyer
            //const userId = this.sessionUserId;
            const postId = this.post._id;
            //const userOpinion = this.post.opinion;
            //var like;
           
            axios.post(`http://localhost:3000/api/posts/${postId}/like`,{
                // Données à envoyer
                    "like": 1
                },
                // En-têtes de requêtes
                {
                    headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'}
                })
                .then(response => {
                    console.log(response);
                  
                    //permet de chercher les nouvelles valeurs du post et réactualiser l'affichage
                    this.getOnePost();
                    //location.reload();
                })
                .catch(error => {
                    console.log(error);
                    //this.$forceUpdate();
                    //location.reload();
                })



        },
        modifyDislike(){
            const token = JSON.parse(localStorage.user).token;
            //Récupérer les données du post à envoyer
            //const userId = this.sessionUserId;
            const postId = this.post._id;
            //const userOpinion = this.post.opinion;
            //var like;
           
            axios.post(`http://localhost:3000/api/posts/${postId}/like`,{
                // Données à envoyer
                    "like": 2
                },
                // En-têtes de requêtes
                {
                    headers: {Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'}
                })
                .then(response => {
                    console.log(response);
                    //this.$forceUpdate();
                    //location.reload();

                    //permet de chercher les nouvelles valeurs du post et réactualiser l'affichage
                    this.getOnePost();
                })



        },
        
    }
}
</script>

<style lang="scss">

    .comment{
        width: 15rem;
        &--xsss{
            @media (min-width: 380px) and (max-width: 459px) {
                width: 20rem;
            }
        }
        &--xss{
            @media (min-width: 460px) and (max-width: 549px) {
                width: 25rem;
            }
        }
        &--xs{
            @media (min-width: 550px) and (max-width: 649px) {
                width: 30rem;
            }
        }
        &--sm{
            @media (min-width: 650px) {
                width: fit-content;
            }
        }
    }
    
</style>