const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");

const app = express();
app.use(express.json());

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;

    //les filtres
    let filter = {};
    if (title) {
      filter.product_name = new RegExp(title, "i");
    }

    if (priceMin) {
      filter.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filter.product_price) {
        filter.product_price.$lte = Number(priceMax);
      } else {
        filter.product_price = { $lte: Number(priceMax) };
      }
    }

    const sortFilter = {};
    if (sort === "price-desc") {
      sortFilter.product_price = -1;
    } else if (sort === "price-asc") {
      sortFilter.product_price = 1;
    }

    const limit = 3;
    let pageRequired = 1;
    if (page) {
      pageRequired = page;
    }

    const skip = (pageRequired - 1) * limit;

    const offers = await Offer.find(filter)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit)
      .populate("owner", "account");

    const count = await Offer.countDocuments(filter);

    res.status(200).json({ count: count, offers: offers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offerId = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offerId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
