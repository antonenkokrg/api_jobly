const Router = require("express").Router;
const router = new Router();

const Jobs = require("../models/jobs");
const { authRequired, adminRequired } = require("../middleware/auth");
const jsonschema = require('jsonschema');
const jobNewSchema = require('../schemas/jobNewSchema');
const jobUpdateSchema = require('../schemas/jobUpdateSchema');
const ExpressError = require("../helpers/ExpressError");


router.post("/", adminRequired, async function (req, res, next) {
    try {

        const validation = jsonschema.validate(req.body, jobNewSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        let jobsData = await Jobs.create(req.body);

        return res.status(201).json({ job: jobsData });
    }

    catch (err) {
        return next(err);
    }
});


// GET /jobs
// Return list all the titles and company handles for all jobs,
//  ordered by the most recently posted jobs. 

router.get("/", authRequired, async function (req, res, next) {
    try {
        let jobs = await Jobs.all(req.query);
        return res.json({ jobs });
    }

    catch (err) {
        return next(err);
    }
});

// GET / jobs / [id]
// Show information about a specific job including a key of company which is an object 
// that contains all of the information about the company associated with it.
// Return JSON of { job: jobData }

router.get("/:id", authRequired, async function (req, res, next) {
    try {
        let jobs = await Jobs.get(req.params.id);
        return res.json({ jobs });
    }

    catch (err) {
        return next(err);
    }
});

// PATCH / jobs / [id]
// This route updates a job by its ID and returns an the newly updated job.
// Return JSON of { job: jobData }



router.patch('/:id', adminRequired, async function (req, res, next) {
    try {
        if ('id' in req.body) {
            throw new ExpressError('You are not allowed to change the id.', 400);
        }

        const validation = jsonschema.validate(req.body, jobUpdateSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        const job = await Jobs.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

// DELETE / jobs / [id]
// This route deletes a job.
// Return JSON of { message: "Job deleted" }

router.delete('/:id', adminRequired, async function (req, res, next) {
    try {
        await Jobs.remove(req.params.id);
        return res.json({ message: 'Job deleted' });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;