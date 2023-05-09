const connectToMongo = require("./db")
const express = require('express')
var cors = require('cors')
const app = express()
const dotenv = require('dotenv')

dotenv.config()
const port = process.env.PORT || 5000;

connectToMongo();
app.use(cors())
app.use(express.json());

app.use("/api/userAuth", require("./Routes/UserAuth"))


app.listen(port, () => {
    console.log(`Server is runnin on http://localhost:${port}`)
})