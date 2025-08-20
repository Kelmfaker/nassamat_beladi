const router = require("express").Router();
const userCtrl = require("../controllers/user.controller");

router.get("/", userCtrl.getUsers);
router.get("/:id", userCtrl.getUser);
router.post("/", userCtrl.createUser);
router.patch("/:id", userCtrl.updateUser);
router.delete("/:id", userCtrl.deleteUser);

module.exports = router;
