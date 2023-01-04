const fs = require('fs')
const path = require('path')

const p = (segment) => {
    return path.join(__dirname, segment)
}

const dateToNumber = (date = null) => {
    if (!date) {
        date = new Date()
    }
    let response = date.getFullYear()
    response *= 100
    response += date.getMonth() + 1
    response *= 100
    response += date.getDate()
    return response
}


const getIndex = () => {
    return new Promise(async (res, rej) => {
        try {
            let data = JSON.parse(fs.readFileSync(p('./../database/index.json')).toString())
            if (dateToNumber() > data.date) {
                data = {index: 1, date: dateToNumber()}
                fs.writeFileSync(p('./../database/index.json'), JSON.stringify(data))
            }
            res(data.index)
        } catch (error) {
            fs.writeFileSync(p('./../database/index.json'), JSON.stringify({index: 1, date: dateToNumber()}))
            res(1)
        }       
    })
}

const updateIndex = () => {
    return new Promise(async (res, rej) => {
        try {
            const index = await getIndex()
            fs.writeFileSync(p('./../database/index.json'), JSON.stringify({index: index + 1, date: dateToNumber()}))
            res(index + 1)
        } catch (error) {
            rej(error)
        }
    })
}

const getTodayFile = () => {
    return new Promise((res, rej) => {
        try {
            const fileName = `./../database/${dateToNumber()}.csv`
            if (!fs.existsSync(p(fileName))) {
                fs.writeFileSync(p(fileName), 'S.No.,Test No.,Yellow,Dark Green,Medium Green,Light Green,Brown\n')
            }
            res(fileName)
        } catch (error) {
            rej(error)
        }
    })
}

const getTestNumber = (id) => {
    return `SQT${dateToNumber()}-${id}`
}

const addNewEntry = (data) => {
    return new Promise(async (res, rej) => {
        try {
            const fileName = await getTodayFile()
            const index = await getIndex()
            const response = `${index},${getTestNumber(index)},${data.join(',')}\n`
            fs.appendFileSync(p(fileName), response)
            await updateIndex()
            res(true)
        } catch (error) {
            rej(error)
        }
    });
}


const initialize = () => {
    if (!fs.existsSync(p('./../database'))) {
        if (!fs.mkdirSync(p('./../database'))) {
            console.log('Unable to initialize database directory')
        }
    }
}

initialize()

module.exports = {
    getIndex,
    updateIndex,
    dateToNumber,
    addNewEntry,
    getTodayFile
}