# SchemaGlue &middot;  [![NPM](https://img.shields.io/npm/v/schemaglue.svg?style=flat)](https://www.npmjs.com/package/schemaglue) [![Tests](https://travis-ci.org/nicolasdao/schemaglue.svg?branch=master)](https://travis-ci.org/nicolasdao/schemaglue) [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause) [![Neap](https://neap.co/img/made_by_neap.svg)](#this-is-what-we-re-up-to)
Break down your big monolitic GraphQl schema.js file into multiple files following the structure that makes sense to you and your team. _**SchemaGlue.js**_ will glue all those files together for you ♥ ʘ‿ʘ.
>* [Install](#install)
>* [How To Use It](#how-to-use-it)
>   - [In Short](#in-short)
>   - [Ignoring Certain Files](#ignoring-certain-files)
>   - [Interesting Examples](#interesting-examples)
>* [About Us](#this-is-what-we-re-up-to)
  
# What It Does
Make your code more readable and understandable by breaking down your monolithic GraphQL schema and resolver into smaller domain models. _**SchemaGlue.js**_ will help glueing them back together.

_**Without SchemaGlue - Stuck With a Monolithic Schema**_
```
- src/
   |__ schema.js

- index.js
- package.json
```
_**With SchemaGlue - Structure Your Schema At Will**_
```
- src/
   |__ graphql/
          |__ product/
          |       |__ schema.graphql
          |       |__ resolver.js
          |
          |__ variant/
                  |__ schema.graphql
                  |__ resolver.js

- index.js
- package.json
```

# Install
```
npm install schemaglue --save
```

# How To use It

>NOTICE: All the following examples use [__*webfunc*__](https://github.com/nicolasdao/webfunc) and [__*graphql-serverless*__](https://github.com/nicolasdao/graphql-serverless). _graphql-serverless_ makes developing GraphQl server locally dead easy while _webfunc_ is a serverless web framework that allows to write Express-like server to deploy them on any serverless solution.

## In Short
```js
const glue = require('schemaglue')

// This will look for any js files under the 'src/graphql' folder that 
// comply to a certain convention described below. Those files describe
// bits and pieces of the GraphQL schema and resolver that schemaglue will
// reassemble into a single 'schema' string and 'resolver' object.
const options = {
	ignore: '**/somefileyoudonotwant.js'
}
const { schema, resolver } = glue('src/graphql', options)
```

### Without SchemaGlue
>PREREQUISITE - Install the following dependencies before running the following code:
>
> `npm install webfunc graphql-serverless schemaglue lodash --save`
>

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

const { graphqlError } = require('graphql-serverless')
const { makeExecutableSchema } = require('graphql-tools') // this dependency is automatically included in 'graphql-serverless'
const _ = require('lodash')

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
  # - **id**: Product id (optional)
  products(id: Int): [Product]

  # ### GET variants
  #
  # _Arguments_
  # - **id**: Variant id (optional)
  variants(id: Int): [Variant]
}
`
const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]
const productResolver = {
  Query: {
    products(root, { id }, context) {
      const results = id ? productMocks.filter(p => p.id == id) : productMocks
      if (results.length > 0)
        return results
      else
        throw graphqlError(404, `Product with id ${id} does not exist.`)
    }
  }
}

const variantMocks = [{ id: 1, name: 'Variant A', shortDescription: 'First variant.' }, { id: 2, name: 'Variant B', shortDescription: 'Second variant.' }]
const variantResolver = {
  Query: {
    variants(root, { id }, context) {
      const results = id ? variantMocks.filter(p => p.id == id) : variantMocks
      if (results.length > 0)
        return results
      else
        throw graphqlError(404, `Variant with id ${id} does not exist.`)
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

const { graphqlHandler } = require('graphql-serverless')
const { app } = require('webfunc')
const { executableSchema } = require('./src/schema')

const graphqlOptions = {
  schema: executableSchema,
  graphiql: { // If you do not want to host any GraphiQl web interface, leave this property undefined.
    endpoint: '/graphiql' 
  }
}

// Host a GraphQl API on 2 endpoints: '/' and '/graphiql'. '/graphiql' is used to host the GraphiQL web interface.
// If you're not interested in the GraphiQl web interface, leave the above 'graphqlOptions.graphiql' undefined and 
// replace the path following ['/', '/graphiql'] with '/'.
app.all(['/', '/graphiql'], graphqlHandler(graphqlOptions))

// Starting the server 
eval(app.listen('app', 4000))
```

Simply run `node index.js` and then browse to [http://localhost:4000/graphiql](http://localhost:4000/graphiql).

### With SchemaGlue
>PREREQUISITE - Install the following dependencies before running the following code:
>
> `npm install webfunc graphql-serverless schemaglue lodash --save`
>

_Project Structure Example_
```
- src/
   |__ graphql/
          |__ product/
          |       |__ schema.graphql
          |       |__ resolver.js
          |
          |__ variant/
                  |__ schema.graphql
                  |__ resolver.js

- index.js
- package.json
```

This is just one example of how to structure the schema and resolver. _**schemaglue**_ looks for all .js and .graphql files under a specific path.

```js
// src/graphql/product/schema.graphql

type Product {
  id: ID!
  name: String!
  shortDescription: String
}

type Query {
  # ### GET products
  #
  # _Arguments_
  # - **id**: Product id (optional)
  products(id: Int): [Product]
}
```

```js
// src/graphql/product/resolver.js

const { graphqlError } = require('graphql-serverless')

const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]

exports.resolver = {
  Query: {
    products(root, { id }, context) {
      const results = id ? productMocks.filter(p => p.id == id) : productMocks
      if (results.length > 0)
        return results
      else
        throw graphqlError(404, `Product with id ${id} does not exist.`)
    }
  }
}
```

```js
// src/graphql/variant/schema.graphql

type Variant {
  id: ID!
  name: String!
  shortDescription: String
}

type Query {
  # ### GET variants
  #
  # _Arguments_
  # - **id**: Variant id (optional)
  variants(id: Int): [Variant]
}
```

```js
// src/graphql/variant/resolver.js

const { graphqlError } = require('graphql-serverless')

const variantMocks = [{ id: 1, name: 'Variant A', shortDescription: 'First variant.' }, { id: 2, name: 'Variant B', shortDescription: 'Second variant.' }]

exports.resolver = {
  Query: {
    variants(root, { id }, context) {
      const results = id ? variantMocks.filter(p => p.id == id) : variantMocks
      if (results.length > 0)
        return results
      else
        throw graphqlError(404, `Variant with id ${id} does not exist.`)
    }
  }
}
```

```js
// index.js

const { graphqlHandler } = require('graphql-serverless')
const { app } = require('webfunc')
const { makeExecutableSchema } = require('graphql-tools') 
const glue = require('schemaglue')

const { schema, resolver } = glue('src/graphql')

const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers: resolver
})

const graphqlOptions = {
  schema: executableSchema,
  graphiql: { 
    endpoint: '/graphiql' 
  }
}

app.all(['/', '/graphiql'], graphqlHandler(graphqlOptions))


eval(app.listen('app', 4000))
```

Simply run `node index.js` and then browse to [http://localhost:4000/graphiql](http://localhost:4000/graphiql).

## Ignoring Certain Files
In some cases, you might want to ignore some specific files under the schema folder (by default, SchemaGlue will take into account all .js files). SchemaGlue adds support to ignore files or folders using [globbing](https://github.com/isaacs/node-glob):
```js
const { schema, resolver } = glue('./src/graphql', { ignore: '**/somefile.js' })
```
This will take into account all .js files under the folder _./src/graphql_, excluding all _somefile.js_ files. The _**ignore**_ property supports both a single string or an array of strings. 
```js
// Ignore more than 1 specific .js file
const { schema:schema1 } = glue('./src/graphql', { ignore: ['**/somefile.js', '**/someotherfile.js'] })
// Ignore all files under the ./src/graphql/variant folder
const { schema:schema1 } = glue('./src/graphql', { ignore: 'variant/**' })
```

## Interesting Examples
_**Unions & Interfaces**_

If you're not familiar with this concept, check out this great article [GraphQL Tour: Interfaces and Unions](https://medium.com/the-graphqlhub/graphql-tour-interfaces-and-unions-7dd5be35de0d). 

In our case, we're interested is knowing how to structure our code with unions or interfaces. If your schema is small, I would recommend to manage your unions and intefaces definitions inside a single schema.js file per model:
```
- src/
   |__ graphql/
          |__ product/
          |       |__ schema.graphql
          |       |__ resolver.js
          |
          |__ variant/
                  |__ schema.graphql
                  |__ resolver.js

- index.js
- package.json
```
Let's take the _schema.graphql_ and _resolver.js_ under _src/graphql/product/_ as an example:

_schema.graphql_
```js
union Product = Bicycle | Racket

type Bicycle {
	id: ID!
	brand: String!
	wheels: Int!
}

type Racket {
	id: ID!
	brand: String!
	sportType: SportType!
}

enum SportType {
	TENNIS
	SQUASH
}

type Query {
  # ### GET products
  #
  # _Arguments_
  # - **id**: Product id (optional)
  products(id: Int): [Product]
}
```

_resolver.js_
```js
const { graphqlError } = require('graphql-serverless')

const productMocks = [{ 
  id: 1,
  brand: 'Giant',
  wheels: 2 
},{ 
  id: 2,
  brand: 'Prince',
  sportType: 'TENNIS' 
}]

exports.resolver = {
  Query: {
    products(root, { id }, context) {
      const results = id ? productMocks.filter(p => p.id == id) : productMocks
      if (results.length > 0)
        return results
      else
        throw graphqlError(404, `Product with id ${id} does not exist.`)
    }
  },

  Product: {
    __resolveType(obj, context, info) {
      return  obj.wheels ? 'Bicycle' :
          obj.sportType ? 'Racket' : null
    }
  }
}
```
> Notice you need to define a _resolveType_ method for the _Product_ type under the _exports.resolver_

# This Is What We re Up To
We are Neap, an Australian Technology consultancy powering the startup ecosystem in Sydney. We simply love building Tech and also meeting new people, so don't hesitate to connect with us at [https://neap.co](https://neap.co).

Our other open-sourced projects:
#### Web Framework & Deployment Tools
* [__*webfunc*__](https://github.com/nicolasdao/webfunc): Write code for serverless similar to Express once, deploy everywhere. 
* [__*now-flow*__](https://github.com/nicolasdao/now-flow): Automate your Zeit Now Deployments.

#### GraphQL
* [__*graphql-serverless*__](https://github.com/nicolasdao/graphql-serverless): GraphQL (incl. a GraphiQL interface) middleware for [webfunc](https://github.com/nicolasdao/webfunc).
* [__*schemaglue*__](https://github.com/nicolasdao/schemaglue): Naturally breaks down your monolithic graphql schema into bits and pieces and then glue them back together.
* [__*graphql-s2s*__](https://github.com/nicolasdao/graphql-s2s): Add GraphQL Schema support for type inheritance, generic typing, metadata decoration. Transpile the enriched GraphQL string schema into the standard string schema understood by graphql.js and the Apollo server client.
* [__*graphql-authorize*__](https://github.com/nicolasdao/graphql-authorize.git): Authorization middleware for [graphql-serverless](https://github.com/nicolasdao/graphql-serverless). Add inline authorization straight into your GraphQl schema to restrict access to certain fields based on your user's rights.

#### React & React Native
* [__*react-native-game-engine*__](https://github.com/bberak/react-native-game-engine): A lightweight game engine for react native.
* [__*react-native-game-engine-handbook*__](https://github.com/bberak/react-native-game-engine-handbook): A React Native app showcasing some examples using react-native-game-engine.

#### Tools
* [__*aws-cloudwatch-logger*__](https://github.com/nicolasdao/aws-cloudwatch-logger): Promise based logger for AWS CloudWatch LogStream.


# License
Copyright (c) 2018, Neap Pty Ltd.
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

<p align="center"><a href="https://neap.co" target="_blank"><img src="https://neap.co/img/neap_color_horizontal.png" alt="Neap Pty Ltd logo" title="Neap" height="89" width="200"/></a></p>
