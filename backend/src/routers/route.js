const router = require("express").Router();
const controller = require("../controllers/controller");
const middleware = require("../middlewares/authorization")

//Anket ekleme
router.post("/add-survey",middleware.authenticateToken, controller.postSurvey);

//Giriş yapma
router.post("/login", controller.postLogin);

//Kayıt olma
router.post("/register", controller.postRegister);

//Çıkış yapma
router.get("/logout",middleware.authenticateToken, controller.getLogout);

//Şifre değişikliği işlemi
router.post("/change-password",middleware.authenticateToken, controller.postChangePassword);

//Kullanıcının profilini getirme
router.get("/profile", middleware.authenticateToken, controller.getProfile)

//Bütün anketleri getirme
router.get("/all-survey", middleware.authenticateToken, controller.getAllSurvey);

//Id ye göre anketi getir
router.get("/survey/:id",middleware.authenticateToken, controller.getIdSurvey)

//Id ye göre anketi cevaplama
router.post("/answer/:id",middleware.authenticateToken,controller.postAnswers);

//Id ye göre anketi görüntüleme
router.get("/user/:id",middleware.authenticateToken,controller.getUserSurvey);

//Id ye göre anket sonuçlarını görüntüleme
router.get("/survey-result/:id",middleware.authenticateToken,controller.getSurveyResult);

//Id ye göre anketin verilerini yansıtma
router.get("/edit-survey/:id",middleware.authenticateToken,controller.getEditSurvey);

//Id ye göre anketi güncelleme
router.post("/edit-survey/:id",middleware.authenticateToken,controller.postEditSurvey);

//Id ye göre anketi silme
router.get("/delete-survey/:id",middleware.authenticateToken,controller.deleteSurvey)

module.exports = router;
