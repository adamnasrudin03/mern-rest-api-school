const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const db = require("../models");
const Model = db.user;
const Role = db.role;

exports.findAll = (req, res, next) => {
  const currentPage = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 2;
  let totalItems;

  let username = req.query.username;
  let email = req.query.email;

  username = username ? { username: { $regex: `${username}` } } : null;
  email = email ? { email: { $regex: `${email}` } } : null;
  const search = username || email;

  Model.find(search)
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Model.find(search)
        .skip((parseInt(currentPage) - 1) * parseInt(perPage))
        .limit(parseInt(perPage));
    })
    .then((result) => {
      const forLoop = async (_) => {
        let newData = [];
        let roleName = [];
        
        //get role name
        for (let i = 0; i < result.length; i++) {
          await Role.findById(result[i].roles).then((dataRole) => {
            roleName.push("ROLE_" + dataRole.name.toUpperCase());
          });
        }
        //change data roles and password
        for (let j = 0; j < result.length; j++) {
          result[j].password = "access not accepted";
          result[j].roles[0] = roleName[j];
          newData.push(result[j]);
        }

        res.status(200).send({
          message: "Find All successfully",
          data: newData,
          total_data: totalItems,
          data_perPage: perPage,
          current_page: currentPage,
          total_page:
            Math.ceil(totalItems / perPage) == 0
              ? currentPage
              : Math.ceil(totalItems / perPage),
        });
      };

      forLoop();
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some errors occurred while find all users data.",
      });
    });
};

exports.findById = (req, res, next) => {
  const id = req.params.id;
  Model.findById(id)
    .then((dataResult) => {
      if (!dataResult) {
        const error = new Error("Data not found");
        error.errorStatus = 404;
        throw error;
      } else {
        Role.findById(dataResult.roles).then((roles) => {
          res.status(200).send({
            message: `Find by id ${id} successfully`,
            data: {
              id: dataResult.id,
              username: dataResult.username,
              email: dataResult.email,
              roles: "ROLE_" + roles.name.toUpperCase(),
              createdAt: dataResult.createdAt,
              updatedAt: dataResult.updatedAt,
            },
          });
        });
      }
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
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  Model.findById(id)
    .then((post) => {
      if (!post) {
        const err = new Error("User Not Found");
        err.errorStatus = 404;
        throw err;
      }

      post.username = username;
      post.email = email;
      post.password = bcrypt.hashSync(password, 8);

      return post.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (req.body.roles) {
          Role.find({ name: { $in: req.body.roles } }, (err, roles) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            user.roles = roles.map((role) => role._id);
            let newUser = roles.map((role) => role.name);
            user.save((err) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }

              res.send({ message: `${newUser} was Updated successfully ` });
            });
          });
        }
      });
    })
    .then((result) => {
      res.status(200).send({
        message: "Updated successfully",
        data: result,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some errors occurred while updating User data.",
      });
    });
};

exports.deleteById = (req, res) => {
  const id = req.params.id;

  Model.findById(id)
    .then((_result) => {
      if (!_result) {
        const error = new Error(
          `Cannot delete user with id = ${id}. Because user was not found!`
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
          err.message || "Some errors occurred while deleting user data.",
      });
    });
};
