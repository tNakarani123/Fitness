const express = require('express');
const User = require('../Modules/UserAuth');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const twilio = require('twilio'); // We'll use Twilio to send OTP via SMS
const randomstring = require('randomstring'); // We'll use the `randomstring` package to generate random OTP
const dotenv = require('dotenv')

dotenv.config()

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


// ROUTE 4: Get loggedin User Details using: Login required http://localhost:5000/api/userAuth/checkUser/{id}
router.get('/checkUser/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        } else {
            success = true;
            res.status(200).json({ success, message: 'User has account in this app' })
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})


//ROUTE 5: update user  http://localhost:5000/api/userAuth/updateuser/64426506a64f5121f673ea55
router.patch('/updateuser/:id', [
    body('Name', 'Please Enter a Name').isLength({ min: 2 }),
    // body('Email', 'Enter a valid email').isEmail(),
    // body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    body('Age', 'Please enter a age'),
    body('Weight', 'Please enter a Weight'),
    body('Height', 'Please enter a Height'),
    body('Gender', 'Please enter a Gender'),
    body('Level', 'Please enter a Level'),
    body('Gym_Time', 'Please enter a Gym_Time'),
    body('Password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    try {
        // const { Name, Email, Mobile_no, Age, Weight, Height, Gender, Level, Gym_Time } = req.body;
        const { Name, Age, Weight, Height, Gender, Level, Gym_Time } = req.body;
        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        // const existingUser = await User.findOne({ Mobile_no: req.body.Mobile_no });
        // if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        //     success = false;
        //     return res.status(400).json({ success, message: 'Mobile number already exists' });
        // }

        const newUser = {};
        // console.log(Email)
        if (Name) { newUser.Name = Name };
        // if (Email) { newUser.Email = Email };
        // if (Mobile_no) { newUser.Mobile_no = Mobile_no };
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

//ROUTE 6: Send otp http://localhost:5000/api/userAuth/verifyMobileNo/64426506a64f5121f673ea55
const otpMap = new Map();

router.get('/verifyMobileNo/:id',
    [
        body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
    ],
    async (req, res) => {
        try {
            const { Mobile_no } = req.body;
            const mob = '+91' + Mobile_no
            let success = false;

            let user = await User.findById(req.params.id);
            if (!user) {
                success = false;
                return res.status(404).json({ success, error: "not found" })
            }

            if (user.Mobile_no == Mobile_no) {
                const otp = randomstring.generate({ length: 6, charset: 'numeric' });

                const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: `Verify Your Mobile Number With This One Time Password ${otp}`,
                    from: process.env.TWILIO_FROM_PHONE_NUMBER,
                    to: mob
                });

                otpMap.set(mob, otp);
                console.log(mob);
                success = true;
                res.status(200).json({ success, message: 'OTP sent successfully' });
            }
            else {
                success = false;
                return res.status(404).json({ success, error: "Enter Valide Mobile number" })
            }
            
        } catch (error) {
            console.error(error.message);
            res.status(500).send("some error occured");
        }
    }
)

//ROUTE 7: verify otp http://localhost:5000/api/userAuth/verifyOtp/644611b542f42ea982f59d23 
router.get('/verifyOtp/:id',
    [
        body('Mobile_no', 'Enter a valid mobile number').isLength({ min: 10, max: 10 }),
        body('otp', 'Enter a valid otp number').isLength({ min: 6, max: 6 }),
    ],
    async (req, res) => {
        const { Mobile_no, otp } = req.body;

        const mob = '+91' + Mobile_no

        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        if (user.Mobile_no == Mobile_no) {
            // Check if the OTP exists for the given mobile number
            console.log(mob)
            if (otpMap.has(mob)) {
                // Get the stored OTP
                const storedOtp = otpMap.get(mob);

                // Check if the entered OTP matches the stored OTP
                if (otp === storedOtp) {
                    // OTP authentication successful
                    success = true;
                    res.status(200).json({ success, message: 'OTP authentication successful' });
                } else {
                    // Invalid OTP
                    success = false;
                    return res.status(404).json({ success, error: 'Invalid OTP' });
                }
            } else {
                // OTP not found for the given mobile number
                success = false;
                return res.status(404).json({ success, error: 'OTP not found for the given mobile number' });
            }
        }
        else {
            success = false;
            return res.status(404).json({ success, error: "Enter Valide Mobile number" })
        }
    }
)


//ROUTE 8: forget password  http://localhost:5000/api/userAuth/forgetPassword/64426506a64f5121f673ea55
router.patch('/forgetPassword/:id', [
    body('Password', 'Password must be atleast 6 characters').isLength({ min: 6 }),
], async (req, res) => {
    try {
        // const { Name, Email, Mobile_no, Age, Weight, Height, Gender, Level, Gym_Time } = req.body;
        const { Password } = req.body;
        let success = false;

        let user = await User.findById(req.params.id);
        if (!user) {
            success = false;
            return res.status(404).json({ success, error: "not found" })
        }

        const newUser = {};
        if (Password) { newUser.Password = Password };

        user = await User.findByIdAndUpdate(req.params.id, { $set: newUser })

        success = true;
        const data = {
            id: user.id,
            success: success
        }

        res.status(200).json({ message: 'Password Update successfully', data })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})






module.exports = router