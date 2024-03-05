const mongoose = require("mongoose");
const Survey = require("./_surveyModel");
const Schema = mongoose.Schema;


//Sorular Veritabanı Modeli
const questionSchema = new Schema(
  {
    questionText: {
      type: String,
      trim: true,
      required: true
    },
    surveyId:{
        type: String,
        trim: true,
        required: true,
        ref: Survey
    }
   
  },
  { collection: "question", timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
