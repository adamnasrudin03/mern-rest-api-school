const { validationResult } = require("express-validator");

const Model = require("../models/studentModel");

exports.addOne = (req, res, next) => {
  const errors = validationResult(req);
  const npm = req.body.npm;
  const name = req.body.name;
  const gender = req.body.gender;
  const address = req.body.address;

  if (!errors.isEmpty()) {
    const err = new Error("Input value tidak sesuai");
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
          err.message || "Some error occurred while creating the Tutorial.",
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
      next(err);
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
        message: "Error retrieving student with id = " + id,
      });
    });
};

exports.updateById = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  Model.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((result) => {
      if (!result) {
        res.status(404).send({
          message: `Cannot update student with id=${id}. Maybe student was not found!`,
        });
      } else {
        res.status(200).send({
          message: "Updated successfully.",
          data: result,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message,
      });
    });
};
