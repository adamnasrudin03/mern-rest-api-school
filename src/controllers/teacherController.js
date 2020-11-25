const { validationResult } = require("express-validator");

const Model = require("../models/teacherModel");

exports.addOne = (req, res, next) => {
  const errors = validationResult(req);

  const nip = req.body.nip;
  const name = req.body.name;
  const gender = req.body.gender;
  const address = req.body.address;

  if (!errors.isEmpty()) {
    const err = new Error("Incorrect input value");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  if (!nip || !name || !gender || !address) {
    const err = new Error("Data cannot be empty!");
    err.errorStatus = 400;
    err.data = errors.array();
    throw err;
  }

  const Post = new Model({
    nip: nip,
    name: name,
    gender: gender,
    address: address,
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
          err.message || "Some errors occurred while adding Teacher data.",
      });
    });
};

exports.findAll = (req, res, next) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 2;
  let totalItems;

  Model.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Model.find()
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
          err.message || "Some errors occurred while find all Teacher data.",
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
        message: err.message || "Error retrieving Teacher with id = " + id,
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
  const nip = req.body.nip;
  const name = req.body.name;
  const gender = req.body.gender;
  const address = req.body.address;

  Model.findById(id)
    .then((post) => {
      if (!post) {
        const err = new Error("Teacher Not Found");
        err.errorStatus = 404;
        throw err;
      }

      post.nip = nip;
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
          err.message || "Some errors occurred while updating Teacher data.",
      });
    });
};

exports.deleteById = (req, res) => {
  const id = req.params.id;

  Model.findById(id)
    .then((_result) => {
      if (!_result) {
        const error = new Error(
          `Cannot delete Teacher with id = ${id}. Because Teacher was not found!`
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
          err.message || "Some errors occurred while deleting Teacher data.",
      });
    });
};
