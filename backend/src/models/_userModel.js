const mongoose = require("mongoose");
const Schema = mongoose.Schema;


//Kullanıcılar Veritabanı Modeli
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
   
  },
  { collection: "user", timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
