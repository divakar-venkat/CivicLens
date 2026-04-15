const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Hash password before saving
// TEMPORARILY DISABLED TO TEST
// userSchema.pre("save", function (next) {
//   if (!this.isModified("password") || !this.password) {
//     return next();
//   }

//   const self = this;

//   bcrypt.genSalt(10, function (err, salt) {
//     if (err) {
//       return next(err);
//     }

//     bcrypt.hash(self.password, salt, function (err, hash) {
//       if (err) {
//         return next(err);
//       }
//       self.password = hash;
//       return next();
//     });
//   });
// });

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);