const mongoose = require("mongoose");
const User = require("./_userModel");
const Question = require("./_questionModel");
const Schema = mongoose.Schema;


//Cevaplar Veritabanı Modeli
const answerSchema = new Schema(
  {
    answerText: {
      type: String,
      trim: true,
      required: true
    },
    questionId:{
        type: String,
        trim: true,
        required: true,
        ref:Question
    },
    userId:{
        type: String,
        trim: true,
        required: true,
        ref:User
    }
 
   
  },
  { collection: "answer", timestamps: true }
);

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
