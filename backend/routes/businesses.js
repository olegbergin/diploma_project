const express = require("express");
const router = express.Router();
const {
  createBusiness,
  getAllBusinesses,
  getBusinessById,
} = require("../controllers/businessController");

router.post("/", createBusiness);
router.get("/", getAllBusinesses);
router.get("/:id", getBusinessById);

module.exports = router;
