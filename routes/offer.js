const express = require("express");
const router = express.Router();

const cloudinary = require("cloudinary").v2;
//Importation express-fileupload
const fileUpload = require("express-fileupload");

const Offer = require("../models/Offer");

const isAuthenticated = require("../middlewares/isAuthenticated");
const app = express();
app.use(express.json());

//fonction qui permet de transformer nos fichiers sous forme de buffer en base64
const convertToBase64 = (file) => {
  //file.date c'est le buffer de l'image
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      //enregistrement del'image sur cloudinary,
      //qui aura pour argument convertToBase64(req.files.picture)
      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );

      const newOffer = new Offer({
        product_name: req.body.title,
        product_description: req.body.description,
        product_price: req.body.price,
        product_details: [
          { brand: req.body.brand },
          { color: req.body.color },
          { etat: req.body.etat },
          { size: req.body.size },
          { city: req.body.city },
        ],

        product_image: result,
        owner: req.user,
      });
      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
