const mongoose = require('mongoose')

const userName = process.argv[2]
const password = process.argv[3]

const url = `mongodb+srv://${userName}:${password}@cluster0.cep1p6c.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 4) {
  // password and username given (grab all users)
  findAll()
} else if (process.argv.length === 6) {
  // add new person
  createPerson(process.argv[4], process.argv[5])
} else {
  console.log('Give userName as 3rd param and password as 4th to show all persons in db. Ex: node mongo.js userName password')
  console.log('Or use this format to add a new person to phonebook: "node mongo.js userName password Ana 040-1234556"')
  process.exit(1)
}

function createPerson (name, number) {
  const person = new Person({
    name,
    number
  })

  person.save().then(res => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
}

function findAll () {
  Person.find({}).then(res => {
    res.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}
