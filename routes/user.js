const express = require('express');
const ExpressError = require('../helpers/ExpressError');
const { ensureCorrectUser, authRequired } = require('../middleware/auth');
const User = require('../models/User');
const { validate } = require('jsonschema');
const userNewSchema = require('../schemas/userNewSchema');
const userUpdateSchema = require('../schemas/userUpdateSchema');
const createToken = require('../helpers/createToken');
const router = express.Router();


// POST / users
// Create a new user and return information on the newly created user.
// Return JSON: { user: user }
router.post('/', async function (req, res, next) {
    try {
        const validation = validate(req.body, userNewSchema);

        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        const newUser = await User.register(req.body);
        const token = createToken(newUser);
        return res.status(201).json({ token });
    } catch (err) {
        return next(err);
    }
});

// GET / users
// Return the username, first_name, last_name and email of the user objects.
// Return JSON: { users: [{ username, first_name, last_name, email }, ...] }

router.get('/', async function (req, res, next) {
    try {
        const users = await User.all();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});

// GET / users / [username]
// Return all the fields for a user excluding the password.
// Return JSON: { user: { username, first_name, last_name, email, photo_url } }

router.get('/:username', async function (req, res, next) {
    try {
        const user = await User.getOne(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

// PATCH / users / [username]
// Update an existing user and return the updated user excluding the password.
// Return JSON: { user: { username, first_name, last_name, email, photo_url } }

router.patch('/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        if ('username' in req.body || 'is_admin' in req.body) {
            throw new ExpressError(
                'You are not allowed to change username or is_admin properties.',
                400);
        }

        const validation = validate(req.body, userUpdateSchema);
        if (!validation.valid) {
            throw new ExpressError(validation.errors.map(e => e.stack), 400);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

router.delete('/:username', ensureCorrectUser, async function (req, res, next) {
    try {
        await User.remove(req.params.username);
        return res.json({ message: 'User deleted' });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;