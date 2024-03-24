const express = require('express')
const morgan = require('morgan')
const app = express()

const generateId = () => {
  return Math.floor(Math.random() * 10000)
}

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

morgan.token('body', (req, res) => {
  return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// info page
app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p> <p>${new Date()}</p>`)
})

// get all persons
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// get one person
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.statusMessage = 'The requested person does not exist'
    response.status(404).end()
  }
})

// del person
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

// add new person
app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    response.statusMessage = 'Name is missing'
    return response.status(400).json({
      error: 'Name is missing'
    })
  } else if (!body.number) {
    response.statusMessage = 'Number is missing'
    response.status(400)
      .json({ error: 'Number is missing' })
      .end()
  } else if (persons.some(person => person.name === body.name)) {
    response.statusMessage = 'Name must be unique'
    response.status(400)
      .json({ error: 'Name must be unique' })
      .end()
  }

  const newPerson = {
    name: body.name,
    number: body.number || '',
    id: generateId()
  }

  persons = persons.concat(newPerson)
  response.json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})