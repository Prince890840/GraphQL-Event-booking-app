const express = require("express");

// bodyParser which parses incoming request bodies in a middleware before your handle.
const bodyParser = require("body-parser");

// graphqlHTTP middleware which provides a simple way to create a GraphQL HTTP server
const { graphqlHTTP } = require("express-graphql");

const mongoose = require("mongoose");

const graphQLSchema = require("./graphql/schema/index");
const graphQLResolver = require("./graphql/resolver/index");

const app = express();

// parse JSON request body
app.use(bodyParser.json());

app.get("/", (req, res, next) => {
  res.send("Hello world");
});

// query means fetch data and mutation means fetch the data

/* rootValue: This property takes an object containing resolver
   functions for each of the defined queries and mutations in the schema. 
   Here we define two resolver functions "events" and "createEvent" for fetching
   and creating events respectively. */

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphQLSchema,
    rootValue: graphQLResolver,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.s9knzde.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch((error) => {
    console.log(error);
  });
