const express = require('express');
const User = require('../Modules/UserAuth');
const router = express.Router();
const { body, validationResult } = require('express-validator');
// const bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET;

// router.get('/', (req, res) => {
//     res.status(200).send("Server has been running on port");
// })

// ROUTE 1: Create a User using: POST http://localhost:5000/api/userAuth/userSignIn. No login required
router.post('/userSignIn', [
    body('Email', 'Enter a valid email').isEmail(),
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('Age', 'Please enter a age'),
    body('Weight', 'Please enter a Weight'),
    body('Height', 'Please enter a Height'),
    body('Gender', 'Please enter a Gender'),
    body('Level', 'Please enter a Level'),
    body('Password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    let success = false;

    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check whether the user with this email exists already
        let user = await User.findOne({ Email: req.body.Email });
        if (user) {
            success = false;
            return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
        }

        user = await User.findOne({ Mobile_no: req.body.Mobile_no });
        if (user) {
            success = false;
            return res.status(400).json({ success, error: "Sorry a user with this mobile number already exists" })
        }

        // Create a new user
        user = await User.create({
            Name: req.body.Name,
            Email: req.body.Email,
            Mobile_no: req.body.Mobile_no,
            Age: req.body.Age,
            Weight: req.body.Weight,
            Height: req.body.Height,
            Gender: req.body.Gender,
            Level: req.body.Level,
            Gym_Time: req.body.Gym_Time,
            Password: req.body.Password
        });
        success = true;
        const data = {
            id: user.id,
            success: success
        }

        // res.json(user)
        res.status(200).send({
            message: 'User sign in successfully',
            data: data
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2: Authenticate a User using: POST http://localhost:5000/api/userAuth/loginuser. No login required
router.post('/loginuser', [
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('Password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { Mobile_no, Password } = req.body;
    try {
        const user = await User.findOne({ Mobile_no });
        if (!user) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentialsssss" });
        }

        const Pass = await User.findOne({ Password });
        if (!Pass) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        console.log(user, Pass)

        success = true;
        const data = {
            id: user.id,
            success: success
        }
        res.status(200).json({ message: 'User Login successfully', data })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 3: Get loggedin User Details using: Login required http://localhost:5000/api/userAuth/getLoginUser/{id}
router.get('/getLoginUser/:id', async (req, res) => {
    try {
        console.log(req.params.id);
        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        } else {
            res.send(user)
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})



//update user  http://localhost:5000/api/userAuth/updateuser/64426506a64f5121f673ea55
router.patch('/updateuser/:id', [
    body('Name', 'Please Enter a Name').isLength({ min: 2 }),
    // body('Email', 'Enter a valid email').isEmail(),
    body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('Age', 'Please enter a age'),
    body('Weight', 'Please enter a Weight'),
    body('Height', 'Please enter a Height'),
    body('Gender', 'Please enter a Gender'),
    body('Level', 'Please enter a Level'),
    body('Gym_Time', 'Please enter a Gym_Time'),
    body('Password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    try {
        const { Name, Email, Mobile_no, Age, Weight, Height, Gender, Level, Gym_Time } = req.body;
        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const existingUser = await User.findOne({ Mobile_no: req.body.Mobile_no });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            success = false;
            return res.status(400).json({ success, message: 'Mobile number already exists' });
        }

        const newUser = {};
        console.log(Email)
        if (Name) { newUser.Name = Name };
        if (Email) { newUser.Email = Email };
        if (Mobile_no) { newUser.Mobile_no = Mobile_no };
        if (Age) { newUser.Age = Age };
        if (Weight) { newUser.Weight = Weight };
        if (Height) { newUser.Height = Height };
        if (Gender) { newUser.Gender = Gender };
        if (Level) { newUser.Level = Level };
        if (Gym_Time) { newUser.Gym_Time = Gym_Time };

        user = await User.findByIdAndUpdate(req.params.id, { $set: newUser })

        success = true;
        const data = {
            id: user.id,
            success: success
        }

        res.status(200).json({ message: 'User Update successfully', data })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

module.exports = router