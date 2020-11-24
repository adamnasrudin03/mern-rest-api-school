const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Lesson = new Schema(
  {
    kodeLesson: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    total_chapter: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lesson", Lesson);
