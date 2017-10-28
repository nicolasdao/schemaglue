/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const { assert } = require('chai')
const { makeExecutableSchema } = require('graphql-tools')
const { glue } = require('../index')


const schema_321312 = `
type UpdateMessage {
	message: String!
}

type Product {
  id: ID!
  name: String!
  shortDescription: String
}

type ProductNameChangedMsg {
	id: ID!
	name: String
}

type Variant {
  id: ID!
  name: String!
  shortDescription: String
}

type VariantNameChangedMsg {
	id: ID!
	name: String
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

type Mutation {
  # ### Update a product's name
  #
  # _Arguments_
  # - **id**: Product's id
  # - **name**: New product's name
  productUpdateName(id: Int, name: String): UpdateMessage

  # ### Update a variant's name
  #
  # _Arguments_
  # - **id**: Variant's id
  # - **name**: New variant's name
  variantUpdateName(id: Int, name: String): UpdateMessage
}

type Subscription {
  # ### Listen for product's name changes
  #
  # _Arguments_
  # - **id**: Product's id
  productNameChanged(id: Int): ProductNameChangedMsg

  # ### Listen for variant's name changes
  #
  # _Arguments_
  # - **id**: Variant's id
  variantNameChanged(id: Int): VariantNameChangedMsg
}`

/*eslint-disable */
describe('glue: BASIC', () => 
	it(`Should glue all schemas and resolvers resp. into a single schema and resolver object.`, () => {
		/*eslint-enable */
		const { schema, resolver } = glue('./test/graphql')
		//console.log(schema)
		assert.equal(schema.replace(/\n|\s|\t/g, ''), schema_321312.replace(/\n|\s|\t/g, ''), '')
		assert.isOk(resolver, 'resolver should exist.')
		assert.isOk(resolver.Query, 'resolver.Query should exist.')
		assert.isOk(resolver.Query.products, 'resolver.Query.products should exist.')
		assert.isOk(resolver.Query.variants, 'resolver.Query.variants should exist.')
		assert.isOk(resolver.Mutation, 'resolver.Mutation should exist.')
		assert.isOk(resolver.Mutation.productUpdateName, 'resolver.Mutation.productUpdateName should exist.')
		assert.isOk(resolver.Mutation.variantUpdateName, 'resolver.Mutation.variantUpdateName should exist.')
		assert.isOk(resolver.Subscription, 'resolver.Subscription should exist.')
		assert.isOk(resolver.Subscription.productNameChanged, 'resolver.Subscription.productNameChanged should exist.')
		assert.isOk(resolver.Subscription.variantNameChanged, 'resolver.Subscription.variantNameChanged should exist.')

		const createExecutableSchema = () => makeExecutableSchema({
			typeDefs: schema,
			resolvers: resolver
		})

		createExecutableSchema()
		assert.doesNotThrow(createExecutableSchema, Error, 'createExecutableSchema should have succeeded.')
	}))

const schema_cwmkl2 = `
type UpdateMessage {
  message: String!
}

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
  # ### GET products
  #
  # _Arguments_
  # - **id**: Product's id (optional)
  products(id: Int): [Product]
}

type Mutation {
  # ### Update a product's name
  #
  # _Arguments_
  # - **id**: Product's id
  # - **name**: New product's name
  productUpdateName(id: Int, name: String): UpdateMessage
}

type Subscription {
  # ### Listen for product's name changes
  #
  # _Arguments_
  # - **id**: Product's id
  productNameChanged(id: Int): ProductNameChangedMsg
}`

/*eslint-disable */
describe('glue: IGNORE FOLDER', () => 
  it(`Should ignore a folder while gluing.`, () => {
    /*eslint-enable */
    const { schema, resolver } = glue('./test/graphql', { ignore: 'variant/*' })
    //console.log(schema)
    assert.equal(schema.replace(/\n|\s|\t/g, ''), schema_cwmkl2.replace(/\n|\s|\t/g, ''), '')
    assert.isOk(resolver, 'resolver should exist.')
    assert.isOk(resolver.Query, 'resolver.Query should exist.')
    assert.isOk(resolver.Query.products, 'resolver.Query.products should exist.')
    assert.isOk(resolver.Mutation, 'resolver.Mutation should exist.')
    assert.isOk(resolver.Mutation.productUpdateName, 'resolver.Mutation.productUpdateName should exist.')
    assert.isOk(resolver.Subscription, 'resolver.Subscription should exist.')
    assert.isOk(resolver.Subscription.productNameChanged, 'resolver.Subscription.productNameChanged should exist.')

    const createExecutableSchema = () => makeExecutableSchema({
      typeDefs: schema,
      resolvers: resolver
    })

    createExecutableSchema()
    assert.doesNotThrow(createExecutableSchema, Error, 'createExecutableSchema should have succeeded.')
  }))

const schema_cec82s = `
type UpdateMessage {
  message: String!
}

type Product {
  id: ID!
  name: String!
  shortDescription: String
}

type ProductNameChangedMsg {
  id: ID!
  name: String
}

type Variant {
  id: ID!
  name: String!
  shortDescription: String
}

type VariantNameChangedMsg {
  id: ID!
  name: String
}

type Query {
  # ### GET products
  #
  # _Arguments_
  # - **id**: Product's id (optional)
  products(id: Int): [Product]
}

type Mutation {
  # ### Update a product's name
  #
  # _Arguments_
  # - **id**: Product's id
  # - **name**: New product's name
  productUpdateName(id: Int, name: String): UpdateMessage

  # ### Update a variant's name
  #
  # _Arguments_
  # - **id**: Variant's id
  # - **name**: New variant's name
  variantUpdateName(id: Int, name: String): UpdateMessage
}

type Subscription {
  # ### Listen for product's name changes
  #
  # _Arguments_
  # - **id**: Product's id
  productNameChanged(id: Int): ProductNameChangedMsg

  # ### Listen for variant's name changes
  #
  # _Arguments_
  # - **id**: Variant's id
  variantNameChanged(id: Int): VariantNameChangedMsg
}`

/*eslint-disable */
describe('glue: IGNORE ONE FILE', () => 
  it(`Should ignore a folder while gluing.`, () => {
    /*eslint-enable */
    const { schema, resolver } = glue('./test/graphql', { ignore: '**/variantquery.js' })
    //console.log(schema)
    assert.equal(schema.replace(/\n|\s|\t/g, ''), schema_cec82s.replace(/\n|\s|\t/g, ''), '')
  }))

const schema_cec82ws = `
type UpdateMessage {
  message: String!
}

type Product {
  id: ID!
  name: String!
  shortDescription: String
}

type ProductNameChangedMsg {
  id: ID!
  name: String
}

type Variant {
  id: ID!
  name: String!
  shortDescription: String
}

type VariantNameChangedMsg {
  id: ID!
  name: String
}

type Mutation {
  # ### Update a product's name
  #
  # _Arguments_
  # - **id**: Product's id
  # - **name**: New product's name
  productUpdateName(id: Int, name: String): UpdateMessage

  # ### Update a variant's name
  #
  # _Arguments_
  # - **id**: Variant's id
  # - **name**: New variant's name
  variantUpdateName(id: Int, name: String): UpdateMessage
}

type Subscription {
  # ### Listen for product's name changes
  #
  # _Arguments_
  # - **id**: Product's id
  productNameChanged(id: Int): ProductNameChangedMsg

  # ### Listen for variant's name changes
  #
  # _Arguments_
  # - **id**: Variant's id
  variantNameChanged(id: Int): VariantNameChangedMsg
}`

/*eslint-disable */
describe('glue: IGNORE DIFFERENT FILES', () => 
  it(`Should ignore a folder while gluing.`, () => {
    /*eslint-enable */
    const { schema, resolver } = glue('./test/graphql', { ignore: ['**/productquery.js', '**/variantquery.js'] })
    //console.log(schema)
    assert.equal(schema.replace(/\n|\s|\t/g, ''), schema_cec82ws.replace(/\n|\s|\t/g, ''), '')
  }))