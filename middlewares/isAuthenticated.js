const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json("Unauthorized");
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    //je vais chercher dans ma collection User si un user à bien ce token
    //console.log("c'est le token de postman" + token);

    const tokenUser = await User.findOne({ token: token }).select("account");
    console.log(tokenUser);
    if (!tokenUser) {
      return res.status(401).json("Unauthorized");
    }
    //je vais créer une clé dans le req dans laquelle je vais ajouter tokenUser
    req.user = tokenUser;
    next();
  } catch (error) {
    res.status(500).json("le token est différent");
  }

  //si je suis bien identifié je next()
};
//cette fonction prend 3 paramètres, next sert à passer à la fonction suivante

module.exports = isAuthenticated;
