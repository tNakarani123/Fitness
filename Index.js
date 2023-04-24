const connectToMongo = require("./db")
const express = require('express')
var cors = require('cors')
const app = express()
const port = 5000

connectToMongo();
app.use(cors())
app.use(express.json());

app.use("/api/userAuth", require("./Routes/UserAuth"))

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})