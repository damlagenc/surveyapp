const Survey = require("../models/_surveyModel");
const User = require("../models/_userModel");
const Question = require("../models/_questionModel");
const Answer = require("../models/_answerModel");
const Blacklist = require("../models/_blacklistModel");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
require("dotenv").config();

//Giriş yapma fonk
const postLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(401).json({ error: "User doesn't exist." });
    }

    const hashedPassword = md5(password);

    if (hashedPassword !== user.password) {
      return res
        .status(401)
        .json({ error: "Wrong username and password combination." });
    }

    const generateAccessToken = await jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      status: "success",
      token: generateAccessToken,
      message: "You have successfully logged in.",
    });
  } catch (error) {
    console.log("postLogin Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Kayıt olma fonk
const postRegister = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);

    if (!username || !password) {
      return res
        .status(401)
        .json({ error: "Please do not leave any field blank" });
    } else {
      const findUser = await User.find({ username: username });
      console.log(findUser);
      if (!findUser[0]) {
        const user = new User();
        user.username = username;
        user.password = md5(password);
        await user.save();
        res.status(200).json({
          status: "success",
          message: "You have successfully register.",
        });
      } else {
        return res.status(401).json({ error: "This user already exist" });
      }
    }
  } catch (error) {
    console.log("postRegister Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Çıkış yapma fonk
const getLogout = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.sendStatus(204);

    const checkIfBlacklisted = await Blacklist.findOne({ token: authHeader });
    // if true, send a no content response.
    if (checkIfBlacklisted) return res.sendStatus(204);
    // otherwise blacklist token
    const newBlacklist = new Blacklist({
      token: authHeader,
    });
    await newBlacklist.save();
    // Also clear request cookie on client

    res.status(200).json({ message: "You are logged out!" });
  } catch (error) {
    console.log("getLogout Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Şifre değişikliğini gerçekleştiren fonk
const postChangePassword = async (req, res, next) => {
  try {
    const { oldPass, newPass } = req.body;

    if (oldPass && newPass) {
      const user = await User.findById(req.user);

      const hashedPassword = md5(oldPass);

      if (hashedPassword !== user.password) {
        return res
          .status(401)
          .json({ error: "Wrong username and password combination." });
      } else {
        await User.findByIdAndUpdate(req.user, { password: md5(newPass) });
        res
          .status(200)
          .json({ status: "success", message: "Password changed" });
      }
    } else {
      return res.status(401).json({ error: "Check the fields" });
    }
  } catch (error) {
    console.log("postChangePassword Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Anket ekleme fonk
const postSurvey = async (req, res, next) => {
  try {
    const survey = new Survey();
    survey.surveyName = req.body.anketAdi;
    survey.userId = req.user;
    await survey.save();

    for (let index = 0; index < req.body.sorular.length; index++) {
      const ques = new Question();
      ques.questionText = req.body.sorular[index].soruMetni;
      ques.surveyId = survey.id;
      await ques.save();
    }

    res.status(200).json({ status: "success", message: "Process successful" });
  } catch (error) {
    console.log("postSurvey Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Kullanıcının profilini getiren fonk
const getProfile = async (req, res, next) => {
  try {
    const surveys = await Survey.find({ userId: req.user });
    res.status(200).json({
      status: "success",
      data: surveys,
      message: "Process successful",
    });
  } catch (error) {
    console.log("getProfile Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Bütün anketleri getiren fonk
const getAllSurvey = async (req, res, next) => {
  try {
    const surveys = await Survey.find({}).populate("userId");

    res.status(200).json({
      status: "success",
      data: surveys,
      message: "Process successful",
    });
  } catch (error) {
    console.log("getAllSurvey Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Id ye göre anketi getiren fonk
const getIdSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id }).populate(
      "userId"
    );

    const question = await Question.find({ surveyId: survey.id });

    res.status(200).json({
      status: "success",
      data: survey,
      question: question,
      message: "Process successful",
    });
  } catch (error) {
    console.log("getIdSurvey Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Id ye göre anketi cevaplarını kaydeden fonk
const postAnswers = async (req, res, next) => {
  try {
    console.log(req.body);
    for (let index = 0; index < req.body.question.length; index++) {
      const ans = new Answer();
      ans.answerText = req.body.question[index].answer;
      ans.questionId = req.body.question[index].id;
      ans.userId = req.user;
      await ans.save();
    }
    res.status(200).json({
      status: "success",
      message: "Process successful",
    });
  } catch (error) {
    console.log("postAnswers Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Id ye göre anketi görüntüleme fonk
const getUserSurvey = async (req, res, next) => {
  try {
    console.log(req.params);
    const survey = await Survey.find({ userId: req.params.id });

    res.status(200).json({
      status: "success",
      data: survey,
      message: "Process successful",
    });
  } catch (error) {
    console.log("getUserSurvey Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Id ye göre anket sonuçlarını görüntüleme fonk
const getSurveyResult = async (req, res, next) => {
  try {
    console.log(req.params);
    var que = [];
    const survey = await Survey.findById(req.params.id).populate("userId");
    const question = await Question.find({ surveyId: survey.id }).select(
      "questionText"
    );
    for (let index = 0; index < question.length; index++) {
      const answer = await Answer.find({ questionId: question[index].id })
        .populate({ path: "userId", select: "username" })
        .select("answerText");

      que.push({
        queName: question[index].questionText,
        answers: answer,
      });
    }

    const data = {
      author: survey.userId.username,
      surveyTitle: survey.surveyName,
      allQuestions: que,
    };
    res.status(200).json({
      status: "success",
      data: data,
      message: "Process successful",
    });
  } catch (error) {
    console.log("getSurveyResult Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Id ye göre anketin verilerini yansıtma fonk
const getEditSurvey = async (req, res, next) => {
  try {
    console.log(req.params);
    var que = [];
    const survey = await Survey.findById(req.params.id).populate("userId");
    const question = await Question.find({ surveyId: survey.id }).select(
      "questionText"
    );
    for (let index = 0; index < question.length; index++) {
      que.push({
        id: question[index].id,
        text: question[index].questionText,
      });
    }

    const data = {
      author: survey.userId.username,
      title: survey.surveyName,
      question: que,
    };
    res.status(200).json({
      status: "success",
      data: data,
      message: "Process successful",
    });
  } catch (error) {
    console.log("getEditSurvey Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Id ye göre anketi güncelleme fonk
const postEditSurvey = async (req, res, next) => {
  try {
    const gelenSorular = [];
    for (let index = 0; index < req.body.questions.length; index++) {
      if (req.body.questions[index].id != "newId") {
        gelenSorular.push(req.body.questions[index]);
      }
    }
    const gelenSoruIDleri = gelenSorular.map((soru) => soru.id);

    const eslesenSorular = await Question.find({ surveyId: req.params.id });

    const eslesenSoruIDleri = eslesenSorular.map((soru) => soru._id.toString());

    const eslesmeyenSoruIDleri = eslesenSoruIDleri.filter(
      (id) => !gelenSoruIDleri.includes(id)
    );

    const deletedQue = await Question.deleteMany({
      _id: { $in: eslesmeyenSoruIDleri },
    });

    for (let index = 0; index < deletedQue.length; index++) {
      const deletedAnswer = await Answer.deleteMany({
        questionId: deletedQue[index].id,
      });
    }

    await Survey.findByIdAndUpdate(req.params.id, {
      surveyName: req.body.title,
    });
    for (let index = 0; index < req.body.questions.length; index++) {
      if (req.body.questions[index].id == "newId") {
        var soru = new Question();
        soru.surveyId = req.params.id;
        soru.questionText = req.body.questions[index].text;
        await soru.save();
       
      } else {
        const que = await Question.findByIdAndUpdate(
          req.body.questions[index].id,
          {
            questionText: req.body.questions[index].text,
          }
        );
      }
    }

    res.status(200).json({
      status: "success",
      message: "Process successful",
    });
  } catch (error) {
    console.log("postEditSurvey Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

//Id ye göre anketi silme fonk
const deleteSurvey = async (req, res, next) => {
  try {
    console.log(req.params);
    const deletedSurvey = await Survey.findByIdAndDelete(req.params.id);

    console.log(deletedSurvey);
    const deletedQuestion = await Question.deleteMany({
      surveyId: deletedSurvey.id,
    });
    const deletedAnswer = await Answer.deleteMany({
      questionId: deletedQuestion.id,
    });

    res.status(200).json({
      status: "success",
      message: "Process successful",
    });
  } catch (error) {
    console.log("deleteSurvey Error: " + error);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  postSurvey,
  postLogin,
  postRegister,
  getLogout,
  postChangePassword,
  getProfile,
  getAllSurvey,
  getIdSurvey,
  postAnswers,
  getUserSurvey,
  getSurveyResult,
  getEditSurvey,
  postEditSurvey,
  deleteSurvey,
};
