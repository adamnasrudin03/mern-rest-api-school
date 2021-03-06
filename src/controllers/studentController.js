const { validationResult } = require("express-validator");

const db = require("../models");
const Model = db.student;

exports.addOne = (req, res, next) => {
  const errors = validationResult(req);

  const npm = req.body.npm;
  const name = req.body.name;
  const gender = req.body.gender;
  const address = req.body.address;

  if (!errors.isEmpty()) {
    const err = new Error("Incorrect input value");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  if (!npm || !name || !gender || !address) {
    const err = new Error("Data cannot be empty!");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  const PostingStudent = new Model({
    npm: npm,
    name: name,
    gender: gender,
    address: address,
  });

  PostingStudent.save()
    .then((result) => {
      res.status(201).send({
        message: "Created Success",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some errors occurred while adding student data.",
      });
    });
};

exports.findAll = (req, res, next) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 2;
  let totalItems;

  let npm = req.query.npm;
  let name = req.query.name;
  let gender = req.query.gender;
  let address = req.query.description;

  npm = npm ? { npm: { $regex: `${npm}` } } : null;
  name = name ? { name: { $regex: `${name}` } } : null;
  gender = gender ? { gender: { $regex: `${gender}` } } : null;
  address = address ? { address: { $regex: `${address}` } } : null;
  const search = npm || name || gender || address;

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
          err.message || "Some errors occurred while find all student data.",
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
        message: err.message || "Error retrieving student with id = " + id,
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
  const npm = req.body.npm;
  const name = req.body.name;
  const gender = req.body.gender;
  const address = req.body.address;

  Model.findById(id)
    .then((post) => {
      if (!post) {
        const err = new Error("Student Not Found");
        err.errorStatus = 404;
        throw err;
      }

      post.npm = npm;
      post.name = name;
      post.gender = gender;
      post.address = address;

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
          err.message || "Some errors occurred while updating student data.",
      });
    });
};

exports.deleteById = (req, res) => {
  const id = req.params.id;

  Model.findById(id)
    .then((_result) => {
      if (!_result) {
        const error = new Error(
          `Cannot delete student with id = ${id}. Because student was not found!`
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
          err.message || "Some errors occurred while deleting student data.",
      });
    });
};
