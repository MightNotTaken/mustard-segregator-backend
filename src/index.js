const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const fileUtility = require('./files.utils')

const port = process.env.PORT || 3030

const app = express()
app.use(cors())

app.get('/getNextID', async (req, res) => {
    try {
        const index = await fileUtility.getIndex()
        res.status(200).send({index})
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get('/addEntry', async (req, res) => {
    try {
        const data = JSON.parse(req.query.data)
        await fileUtility.addNewEntry(data)
        res.status(200).send({
            status: 'done'
        })
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

app.get('/export', async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})
app.listen(port, () => {
    console.log('Server listening on port : ', port)
})






