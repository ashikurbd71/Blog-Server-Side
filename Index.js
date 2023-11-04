const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000

// midle

app.use(cors())
app.use(express.json())



app.get('/', (req, res) => {
  res.send('Blog Server Runing......!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})