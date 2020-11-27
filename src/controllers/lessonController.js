const { validationResult } = require("express-validator");

const db = require("../models");
const Model = db.lesson;

exports.addOne = (req, res, next) => {
  const errors = validationResult(req);

  const kodeLesson = req.body.kodeLesson;
  const name = req.body.name;
  const total_chapter = req.body.total_chapter;
  const description = req.body.description;

  if (!errors.isEmpty()) {
    const err = new Error("Incorrect input value");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  if (!kodeLesson || !name || !total_chapter || !description) {
    const err = new Error("Data cannot be empty!");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  const Post = new Model({
    kodeLesson: kodeLesson,
    name: name,
    total_chapter: total_chapter,
    description: description,
  });

  Post.save()
    .then((result) => {
      res.status(201).send({
        message: "Created Success",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some errors occurred while adding Lesson data.",
      });
    });
};

exports.findAll = (req, res, next) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 2;
  let totalItems;

  let kodeLesson = req.query.kodeLesson;
  let name = req.query.name;
  let totalChapter = req.query.totalChapter;
  let description = req.query.description;

  kodeLesson = kodeLesson ? { kodeLesson: { $regex: `${kodeLesson}` } } : null;
  name = name ? { name: { $regex: `${name}` } } : null;
  totalChapter = totalChapter
    ? { total_chapter: { $regex: `${totalChapter}` } }
    : null;
  description = description
    ? { description: { $regex: `${description}` } }
    : null;
  const search = kodeLesson || name || totalChapter || description;

  Model.find(search)
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Model.find(search)
        .skip((parseInt(currentPage) - 1) * parseInt(perPage))
        .limit(parseInt(perPage));
    })
    .then((result) => {
      res.status(200).send({
        message: "Find All successfully",
        data: result,
        total_data: totalItems,
        data_perPage: perPage,
        current_page: currentPage,
        total_page:
          Math.ceil(totalItems / perPage) == 0
            ? currentPage
            : Math.ceil(totalItems / perPage),
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some errors occurred while find all Lesson data.",
      });
    });
};

exports.findById = (req, res, next) => {
  const id = req.params.id;
  Model.findById(id)
    .then((result) => {
      if (!result) {
        const error = new Error("Data not found");
        error.errorStatus = 404;
        throw error;
      }
      res.status(200).send({
        message: `Find by id ${id} successfully`,
        data: result,
      });
    })
    .catch((err) => {
      console.log(err.message);
      res.status(500).send({
        message: err.message || "Error retrieving Lesson with id = " + id,
      });
    });
};

exports.updateById = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const err = new Error("Incorrect input value");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;
  const kodeLesson = req.body.kodeLesson;
  const name = req.body.name;
  const total_chapter = req.body.total_chapter;
  const description = req.body.description;

  Model.findById(id)
    .then((post) => {
      if (!post) {
        const err = new Error("Lesson Not Found");
        err.errorStatus = 404;
        throw err;
      }

      post.kodeLesson = kodeLesson;
      post.name = name;
      post.total_chapter = total_chapter;
      post.description = description;

      return post.save();
    })
    .then((result) => {
      res.status(200).send({
        message: "Updated successfully.",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some errors occurred while updating Lesson data.",
      });
    });
};

exports.deleteById = (req, res) => {
  const id = req.params.id;

  Model.findById(id)
    .then((_result) => {
      if (!_result) {
        const error = new Error(
          `Cannot delete Lesson with id = ${id}. Because Lesson was not found!`
        );
        error.errorStatus = 404;
        throw error;
      }

      return Model.findByIdAndRemove(id);
    })
    .then((result) => {
      res.send({
        message: "Deleted successfully!",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some errors occurred while deleting Lesson data.",
      });
    });
};
