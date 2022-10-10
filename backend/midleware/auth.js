const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {

        // Décode le token alloué à l'utilisateur
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, `${process.env.TOKEN_SECRET}`);
        const userId = decodedToken.userId;
        const adminRole = decodedToken.adminRole;

        console.log("adminRole: "+adminRole);
        //Vérifie l'authentification
        req.auth = {
            userId: userId,
            adminRole: adminRole,
        };
        next();
    } catch (error) {
        res.status(401).json({ error: error | 'Requête non authentifiée!'});
    }
};