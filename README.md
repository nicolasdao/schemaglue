<a href="https://neap.co" target="_blank"><img src="https://neap.co/img/neap_black_small_logo.png" alt="Neap Pty Ltd logo" title="Neap" align="right" height="50" width="120"/></a>

# SchemaGlue - Glues Bits and Pieces Of GraphQL Schemas & Resolvers Together
[![NPM][1]][2] [![Tests][3]][4]

[1]: https://img.shields.io/npm/v/schemaglue.svg?style=flat
[2]: https://www.npmjs.com/package/schemaglue
[3]: https://travis-ci.org/nicolasdao/schemaglue.svg?branch=master
[4]: https://travis-ci.org/nicolasdao/schemaglue

Make your code more readable and understandable by breaking down your monolithic GraphQL schema and resolver into smaller domain models. _**SchemaGlue.js**_ will help glueing them back together.

SchemaGlue.js is designed specifically for building GraphQL schema using the awesome [Apollo's graphql-tools.js](https://github.com/apollographql/graphql-tools).

## Install
```
npm install schemaglue --save
```

## How To use It
#### In Short

```js
const { glue } = require('schemaglue')

// This will look for any js files under the 'src/graphql' folder that 
// comply to a certain convention described below. Those files describe
// bits and pieces of the GraphQL schema and resolver that schemaglue will
// reassemble into a single 'schema' string and 'resolver' object.
const { schema, resolver } = glue('src/graphql')
```

> NOTE: The following example assumes this project is hosted on Google Cloud Functions (Google serverless solution), but it is easily applicable to any other projects that uses [Apollo's graphql-tools.js](https://github.com/apollographql/graphql-tools). If you want to know more about hosting GraphQL APIs on Google Cloud Functions or Firebase (AWS Lambda coming soon), check out those 2 projects:
> - [webfunc](https://github.com/nicolasdao/webfunc): An assistant to easily create & deploy Google Cloud Functions project.
> - [graphql-serverless](https://github.com/nicolasdao/graphql-serverless): A GraphQL plugin for webfunc that also exposes a GraphiQL front-end.

#### Without SchemaGlue
_Project Structure Example_
```
- src/
   |__ schema.js

- index.js
- package.json
```

Where the _schema.js_ file would contain the entire GraphQl schema and resolver definition:
```js
// src/schema.js

const { makeExecutableSchema } = require('graphql-tools')
const _ = require('lodash')
const httpError = require('http-errors')

const schema = `
type Product {
  id: ID!
  name: String!
  shortDescription: String
}

type Variant {
  id: ID!
  name: String!
  shortDescription: String
}

type Query {
  # ### GET products
  #
  # _Arguments_
  # - **id**: Product's id (optional)
  products(id: Int): [Product]

  # ### GET variants
  #
  # _Arguments_
  # - **id**: Variant's id (optional)
  variants(id: Int): [Variant]
}
`
const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
const productResolver = {
  Query: {
    products(root, { id }, context) {
      const results = id ? _(productMocks).filter(p => p.id == id) : productMocks
      if (results)
        return results
      else
        throw httpError(404, `Product with id ${id} does not exist.`)
    }
  }
}

const variantMocks = [{ id: 1, name: 'Variant A', shortDescription: 'First variant.' }, { id: 2, name: 'Variant B', shortDescription: 'Second variant.' }]
const variantResolver = {
  Query: {
    variants(root, { id }, context) {
      const results = id ? _(variantMocks).filter(p => p.id == id) : variantMocks
      if (results)
        return results
      else
        throw httpError(404, `Variant with id ${id} does not exist.`)
    }
  }
}

const executableSchema = makeExecutableSchema({
	typeDefs: schema,
	resolvers: _.merge(productResolver, variantResolver) 
})

module.exports = {
	executableSchema
}
```

```js
// index.js

const { HttpHandler } = require('graphql-serverless')
const { serveHttp, app } = require('webfunc')
const { executableSchema } = require('./src/schema')

const graphqlOptions = {
    schema: executableSchema,
    graphiql: true,
    endpointURL: "/graphiql"
}

app.use(new HttpHandler(graphqlOptions))

exports.main = serveHttp(app.resolve({ path: '/', handlerId: 'graphql' }))
```

#### With SchemaGlue
_Project Structure Example_
```
- src/
   |__ graphql/
          |__ product/
          |       |__ schema.js
          |       |__ resolver.js
          |
          |__ variant/
                  |__ schema.js
                  |__ resolver.js

- index.js
- package.json
```

This is just one example of how to structure the schema and resolver. _**schemaglue**_ looks for all js files under a specific path. That specific path can be set up in 3 different ways:
1. Programmatically: ```const { schema, resolver } = glue('src/graphql')``` 
2. Using a _**appconfig.json**_ file. Set up the path as follow:
	```js
	"graphql": {
		"schema": "src/graphql"
	}
	```
3. Default value is 'schema'. That means that if no value is set in 1 or 2, then this default folder is used. 

Js files following the following conventions will be extracted by _schemaglue_ to rebuild the GraphQL schema and resolver from the example above:

```js
// src/graphql/product/schema.js

exports.schema = `
type Product {
  id: ID!
  name: String!
  shortDescription: String
}
`
// Notice that we have omitted to wrap the above with 'type Query { }'
exports.query = `
  # ### GET products
  #
  # _Arguments_
  # - **id**: Product's id (optional)
  products(id: Int): [Product]
`

// We could also add the same for mutation and subscription:
// exports.mutation = `...`
//
// exports.subscription = `...`
```

```js
// src/graphql/product/resolver.js

const httpError = require('http-errors')

const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]

exports.resolver = {
    Query: {
        products(root, { id }, context) {
          const results = id ? productMocks.filter(p => p.id == id) : productMocks
          if (results)
            return results
          else
            throw httpError(404, `Product with id ${id} does not exist.`)
        }
    }

    // Add Mutation or Subscription here as well:
    // Mutation: { ... }
    // Subscription: { ... }
}
```

```js
// src/graphql/variant/schema.js

exports.schema = `
type Variant {
  id: ID!
  name: String!
  shortDescription: String
}
`
// Notice that we have omitted to wrap the above with 'type Query { }'
exports.query = `
  # ### GET variants
  #
  # _Arguments_
  # - **id**: Variant's id (optional)
  variants(id: Int): [Variant]
`

// We could also add the same for mutation and subscription:
// exports.mutation = `...`
//
// exports.subscription = `...`
```

```js
// src/graphql/variant/resolver.js

const httpError = require('http-errors')

const variantMocks = [{ id: 1, name: 'Variant A', shortDescription: 'First variant.' }, { id: 2, name: 'Variant B', shortDescription: 'Second variant.' }]

exports.resolver = {
    Query: {
        variants(root, { id }, context) {
          const results = id ? variantMocks.filter(p => p.id == id) : variantMocks
          if (results)
            return results
          else
            throw httpError(404, `Variant with id ${id} does not exist.`)
        }
    }

    // Add Mutation or Subscription here as well:
    // Mutation: { ... }
    // Subscription: { ... }
}
```

```js
// index.js

const { HttpHandler } = require('graphql-serverless')
const { serveHttp, app } = require('webfunc')
const { makeExecutableSchema } = require('graphql-tools')
const { glue } = require('schemaglue')

const { schema, resolver } = glue('src/graphql')

const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolver
})

const graphqlOptions = {
    schema: executableSchema,
    graphiql: true,
    endpointURL: "/graphiql"
}

app.use(new HttpHandler(graphqlOptions))

exports.main = serveHttp(app.resolve({ path: '/', handlerId: 'graphql' }))
```

> Notice that the path where the graphql schemas are located has been explicitely defined (_'src/graphql'_). This variable is optional and could have been defined in an _**appconfig.json**_ file instead. Simply add that file at the root of the project. Example:
>```js
>"graphql": {
>	"schema": "src/graphql"
>}
>```

If this property is not setup, or if no _appconfig.json_ has been defined, then _schemaglue_ assumes that all the schema and resolver definitions are located under a ./schema/ folder. If neither the _appconfig.json_ file nor the _schema_ folder are defined, then an exception will be throwned by the _glue_ method.

## This Is What We re Up To
We are Neap, an Australian Technology consultancy powering the startup ecosystem in Sydney. We simply love building Tech and also meeting new people, so don't hesitate to connect with us at [https://neap.co](https://neap.co).

## License
Copyright (c) 2017, Neap Pty Ltd.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Neap Pty Ltd nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL NEAP PTY LTD BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
