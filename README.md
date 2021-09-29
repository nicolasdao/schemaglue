# SchemaGlue &middot;	[![NPM](https://img.shields.io/npm/v/schemaglue.svg?style=flat)](https://www.npmjs.com/package/schemaglue) [![Tests](https://travis-ci.org/nicolasdao/schemaglue.svg?branch=master)](https://travis-ci.org/nicolasdao/schemaglue) [![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause) [![Neap](https://neap.co/img/made_by_neap.svg)](#this-is-what-we-re-up-to) [![npm downloads](https://img.shields.io/npm/dt/schemaglue.svg?style=flat)](https://www.npmjs.com/package/schemaglue)

Break down your big monolitic GraphQl schema.js file into multiple files following the structure that makes sense to you and your team. _**SchemaGlue.js**_ will glue all those files together for you ♥ ʘ‿ʘ.
> * [Install](#install)
> * [How To Use It](#how-to-use-it)
>	- [In Short](#in-short)
>	- [Typescript Support & Custom Globbing](#typescript-support--custom-globbing)
>	- [Ignoring Certain Files](#ignoring-certain-files)
>	- [Interesting Examples](#interesting-examples)
>		- [Unions & Interfaces](#unions--interfaces)
>	- [Replacing `.graphql` files with plain `.js` or `.ts` files](#replacing-graphql-files-with-plain-js-or-ts-files)
> * [Typescript support](#typescript-support)
> * [Pull-Requests & Contribution](#contribute)
> * [About Us](#this-is-what-we-re-up-to)
	
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
			|		|__ schema.graphql
			|		|__ resolver.js
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
	js: '**/*.js', // default
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
const express = require('express')
const app = express()
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
app.listen(4000, () => console.log('Server start. Go to http://localhost:4000/graphiql'))
```

Simply run `node index.js` and then browse to [http://localhost:4000/graphiql](http://localhost:4000/graphiql).

### With SchemaGlue
>PREREQUISITE - Install the following dependencies before running the following code:
>
> `npm i express graphql-serverless schemaglue lodash --save`
>

_Project Structure Example_
```
- src/
	|__ graphql/
			|__ product/
			|		|__ schema.graphql
			|		|__ resolver.js
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
const express = require('express')
const app = express()
const { makeExecutableSchema } = require('graphql-tools')
const glue = require('schemaglue')

const { schema, resolver } = glue('src/graphql')

const executableSchema = makeExecutableSchema({
	typeDefs: schema,
	resolvers: resolver
})

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
app.listen(4000, () => console.log('Server start. Go to http://localhost:4000/graphiql'))
```

Simply run `node index.js` and then browse to [http://localhost:4000/graphiql](http://localhost:4000/graphiql).

## Typescript Support & Custom Globbing

By default, schemaglue uses .js files to define resolvers and .graphql files to define schemas. If your project uses Typescript, it is possible to change the default behavior to target resolvers that use .ts files:

```js
const { schema, resolver } = glue('src/graphql', { mode: 'ts' })
```

You can go even further by defining your own custom globbing rule if you want to only include certain resolver files:

```js
const { schema, resolver } = glue('src/graphql', { mode: 'product/*.js' })
```

The above will only get resolvers defined under the `src/graphql/product/` folder.


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

## Custom Extensions
You can specify a custom glob to select your resolver files with different extensions.
```js
const { schema, resolver } = glue('./src/graphql', { js: '**/*.ts' })
```

## Interesting Examples
### Unions & Interfaces

If you're not familiar with this concept, check out this great article [GraphQL Tour: Interfaces and Unions](https://medium.com/the-graphqlhub/graphql-tour-interfaces-and-unions-7dd5be35de0d). 

In our case, we're interested is knowing how to structure our code with unions or interfaces. If your schema is small, I would recommend to manage your unions and intefaces definitions inside a single schema.js file per model:
```
- src/
	|__ graphql/
			|__ product/
			|		|__ schema.graphql
			|		|__ resolver.js
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
		return	obj.wheels ? 'Bicycle' :
			obj.sportType ? 'Racket' : null
	}
	}
}
```
> Notice you need to define a _resolveType_ method for the _Product_ type under the _exports.resolver_

### Mix `.graphql` files with inline string schemas

```js
const glue = require('schemaglue')

const { schema } = glue('src/graphql', {
	schemas:[`
	type Product {
		id: ID
		name: String
	}

	type Query {
		products(id:ID, name:String): [Product]
	}`,
	`
	enum VehicleEnum {
		car
		bike
		bus
	}

	type Mutation {
		createCar: Car
	}
	`]
})
```

## Replacing `.graphql` files with plain `.js` or `.ts` files

There are some edge cases where some software engineers may want to express their GraphQL schema using `.js` or `.ts` files rather than `.graphql` files (e.g., [Typescript support](#typescript-support)). 

In that case, you will have to transform your files as follow:

__`product.graphql` example:__ 

```graphql
type Product {
	id: ID!
	name: String!
	shortDescription: String
}

type ProductNameChangedMsg {
	id: ID!
	name: String
}

type Query {
	products(id: Int): [Product]
}

type Mutation {
	productUpdateName(id: Int, name: String): ProductNameChangedMsg
}

type Subscription {
	productNameChanged(id: Int): ProductNameChangedMsg
}
```

__`product.js` example:__ 

```js
exports.schema = `
type Product {
	id: ID!
	name: String!
	shortDescription: String
}

type ProductNameChangedMsg {
	id: ID!
	name: String
}
`

exports.query = `
	products(id: Int): [Product]
`

exports.mutation = `
	productUpdateName(id: Int, name: String): ProductNameChangedMsg
`

exports.subscription = `
	productNameChanged(id: Int): ProductNameChangedMsg
`
```

# Typescript support

As explained in the [Typescript Support & Custom Globbing](#typescript-support--custom-globbing) section, Schemaglue supports resolvers written in Typescript. However, Typescript is less than friendly with the `.graphql` file extension. The main challenge occurs when the Typescript code is compiled (for example into a `dist` folder). You'll notice that the `.graphql` files are omitted, therefore breaking your code in production. This article explains how to use Webpack to include those `.graphql` files: [How to resolve import for the .graphql file with typescript and webpack](https://dev.to/open-graphql/how-to-resolve-import-for-the-graphql-file-with-typescript-and-webpack-35lf).

However, for those of you who do not wish to mess up with more Webpack configuration, there is a solution with a trade-off. Schemaglue supports GraphQL schema file written in plain JS or TS as explained in the [Replacing `.graphql` files with plain `.js` or `.ts` files](#replacing-graphql-files-with-plain-js-or-ts-files) section. You will loose in readability as your GraphQL schema will have to be expressed as raw Javascript strings. To make this work, update the your code as follow:

Before:

```js
const { schema, resolver } = glue('src/graphql', { mode:'ts' })
```

After:

```js
const { schema, resolver } = glue('src/graphql', { mode:'**/*.[jt]s' })
```

This example above helps reading `.ts` files and `.js` files at the same time. This is required as your `.ts` files are compiled to `.js` files in your `dist` folder. 


If you choose that convention, the GraphQL schema will be properly exported to your `dist` folder.

# Contribute
## General Guidance
We're always super excited to accept pull-requests. We're not too strict about how you implement your fixes or desired features, but we would still highly appreciate if you could:

1. Lint your code using the command `npm run eslint` before pushing your pull-request.
2. Make sure you've added a unit test under the `test` folder (more about that in the following section).
3. Make sure all the unit tests pass by running `npm test`

### THANKS A LOT YOU AWESOME CONTRIBUTOR!

## Unit Testing
All unit tests are located under the `test` folder. There, you will notice 3 main components:

1. `graphql` folder: This folder contains a series of mock files that you should use to test schemaglue. Feel free to add your own, but please, stick to the already defined naming convention.
2. `index.js`: This file is the main unit test file. You will most probably add your unit test there. Please, stick with the naming convention in that file.
3. `utils.js`: This file contains the unit tests for the src/utils.js code. Please, stick with the naming convention in that file.

To run the test, simply execute this command: `npm test`.

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
