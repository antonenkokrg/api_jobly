const Router = require("express").Router;
const router = new Router();

const Companies = require("../models/companies");
const { authRequired, adminRequired } = require("../middleware/auth");
const jsonschema = require('jsonschema');
const companyNewSchema = require('../schemas/companyNewSchema');
const companyUpdate = require('../schemas/companyUpdate.json');
const ExpressError = require("../helpers/ExpressError");


router.get("/", authRequired, async function (req, res, next) {
  try {
    let companies = await Companies.all(req.query);
    return res.json({ companies });
  }

  catch (err) {
    return next(err);
  }
});


//   POST /companies
//   Create a new company and return the newly created company.

router.post("/", adminRequired, async function (req, res, next) {
  try {

    const validation = jsonschema.validate(req.body, companyNewSchema);
    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    let companyData = await Companies.create({
      handle: req.body.handle,
      name: req.body.name,
      num_employees: req.body.num_employees,
      description: req.body.description,
      logo_url: req.body.logo_url
    });

    return res.status(201).json({ company: companyData });
  }

  catch (err) {
    return next(err);
  }
});

// GET /companies/[handle]
// Return a single company found by its id.

router.get("/:id", authRequired, async function (req, res, next) {
  try {
    let company = await Companies.get(req.params.id);
    return res.json({ company });
  }

  catch (err) {
    return next(err);
  }
});

// PATCH /companies/[handle]
// Update an existing company and return JSON of {company: companyData}

router.patch('/:handle', adminRequired, async function (req, res, next) {
  try {
    if ('handle' in req.body) {
      throw new ExpressError('You are not allowed to change the handle.', 400);
    }

    const validation = jsonschema.validate(req.body, companyUpdate);
    if (!validation.valid) {
      throw new ExpressError(validation.errors.map(e => e.stack), 400);
    }

    const company = await Companies.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

// DELETE /companies/[handle]
// Remove an existing company and return a return JSON of {message: "Company deleted"}

router.delete('/:handle', adminRequired, async function (req, res, next) {
  try {
    await Companies.remove(req.params.handle);
    return res.json({ message: 'Company deleted' });
  } catch (err) {
    return next(err);
  }
});






module.exports = router;