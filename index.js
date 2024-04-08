require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body)
})

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

// info page
app.get('/info', (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.send(
        `<p>Phonebook has info for ${
          people.length
        } people</p> <p>${new Date()}</p>`
      )
    })
    .catch((e) => next(e))
})

// get all persons
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people)
    })
    .catch((error) => next(error))
})

// get one person
app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findById(id)
    .then((returnedPerson) => {
      if (returnedPerson) {
        response.json(returnedPerson)
      } else {
        response.json(204).end()
      }
    })
    .catch((error) => next(error))
})

// del person
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        console.log('deleted: ', deletedPerson)
        response.json(deletedPerson)
      } else {
        console.log('person not found')
        response.status(204).end()
      }
    })
    .catch((error) => next(error))
})

// add new person
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name) {
    response.statusMessage = 'Name is missing'
    return response.status(400).json({
      error: 'Name is missing'
    })
  } else if (!body.number) {
    response.statusMessage = 'Number is missing'
    response.status(400).json({ error: 'Number is missing' }).end()
  }

  const person = new Person({
    name: body.name,
    number: body.number || ''
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson).end()
    })
    .catch((error) => next(error))
})

// update person
app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const body = req.body

  const newPerson = {
    name: body.name,
    number: body.number
  }
  const opts = { new: true, runValidators: true, context: 'query' }

  Person.findByIdAndUpdate(id, newPerson, opts)
    .then((updatedPerson) => res.json(updatedPerson))
    .catch((e) => next(e))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
