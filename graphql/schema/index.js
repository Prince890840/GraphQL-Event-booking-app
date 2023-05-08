// buildSchema property takes js template literals string which we can then use to defined our schema
const { buildSchema } = require("graphql");

module.exports = buildSchema(`

type Event {
  _id: ID!
  title: String!
  description: String!
  date: String!
  price: Float!
  creator: User!
}

type User {
  _id: ID!
  email: String!
  password: String
  createdEvents: [Event!]
}

type Booking {
  _id: ID!
  event: Event!
  user: User!
  createdAt: String!
  updatedAt: String!
}

type RootQuery {
    events: [Event!]!
    bookings: [Booking!]!
}

input EventInput {
  title: String!
  description: String!
  price: Float!
  date: String!
}

input UserInput {
  email: String!
  password: String!
}

type RootMutation {
    createEvent(eventInput :EventInput): Event
    createUser(userInput :UserInput): User
    bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
}

schema {
    query: RootQuery
    mutation: RootMutation
}
`);
