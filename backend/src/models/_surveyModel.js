const mongoose = require("mongoose");
const User = require("./_userModel");
const Schema = mongoose.Schema;


//Anketler Veritabanı Modeli
const surveySchema = new Schema(
  {
    surveyName: {
      type: String,
      trim: true,
      required: true
    },
    userId:{
        type: String,
        trim: true,
        required: true,
        ref: User 
    },

   
  },
  { collection: "survey", timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);

module.exports = Survey;
