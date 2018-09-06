/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const { assert } = require('chai')
const { makeExecutableSchema } = require('graphql-tools')
const glue = require('../index')

describe('glue', () => {
	it('#1 BASIC - Should glue all schemas and resolvers resp. into a single schema and resolver object.', () => {
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

		const schema_321312_B = `
    type Product {
      id: ID!
      name: String!
      shortDescription: String
    }

    type ProductNameChangedMsg {
      id: ID!
      name: String
    }

    type UpdateMessage {
      message: String!
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
      # ### GET variants
      #
      # _Arguments_
      # - **id**: Variant's id (optional)
      variants(id: Int): [Variant]

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

		const { schema, resolver } = glue('./test/graphql/mock_01')
		
		assert.equal(schema.replace(/\n|\s|\t/g, ''), schema_321312.replace(/\n|\s|\t/g, ''), 'Oops, error in schema')
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

		let createExecutableSchema = () => makeExecutableSchema({
			typeDefs: schema,
			resolvers: resolver
		})

		createExecutableSchema()
		assert.doesNotThrow(createExecutableSchema, Error, 'createExecutableSchema should have succeeded.')

		const { schema:schema_02, resolver:resolver_02 } = glue('./test/graphql/mock_02')
    
		assert.equal(schema_02.replace(/\n|\s|\t/g, ''), schema_321312.replace(/\n|\s|\t/g, ''), 'Oops, error in schema_02')
		assert.isOk(resolver_02, 'resolver_02 should exist.')
		assert.isOk(resolver_02.Query, 'resolver_02.Query should exist.')
		assert.isOk(resolver_02.Query.products, 'resolver_02.Query.products should exist.')
		assert.isOk(resolver_02.Query.variants, 'resolver_02.Query.variants should exist.')
		assert.isOk(resolver_02.Mutation, 'resolver_02.Mutation should exist.')
		assert.isOk(resolver_02.Mutation.productUpdateName, 'resolver_02.Mutation.productUpdateName should exist.')
		assert.isOk(resolver_02.Mutation.variantUpdateName, 'resolver_02.Mutation.variantUpdateName should exist.')
		assert.isOk(resolver_02.Subscription, 'resolver_02.Subscription should exist.')
		assert.isOk(resolver_02.Subscription.productNameChanged, 'resolver_02.Subscription.productNameChanged should exist.')
		assert.isOk(resolver_02.Subscription.variantNameChanged, 'resolver_02.Subscription.variantNameChanged should exist.')

		createExecutableSchema = () => makeExecutableSchema({
			typeDefs: schema_02,
			resolvers: resolver_02
		})

		createExecutableSchema()
		assert.doesNotThrow(createExecutableSchema, Error, 'createExecutableSchema should have succeeded.')

		const { schema:schema_03, resolver:resolver_03 } = glue('./test/graphql/mock_03')
    
		assert.equal(schema_03.replace(/\n|\s|\t/g, ''), schema_321312_B.replace(/\n|\s|\t/g, ''), 'Oops, error in schema_03')
		assert.isOk(resolver_03, 'resolver_03 should exist.')
		assert.isOk(resolver_03.Query, 'resolver_03.Query should exist.')
		assert.isOk(resolver_03.Query.products, 'resolver_03.Query.products should exist.')
		assert.isOk(resolver_03.Query.variants, 'resolver_03.Query.variants should exist.')
		assert.isOk(resolver_03.Mutation, 'resolver_03.Mutation should exist.')
		assert.isOk(resolver_03.Mutation.productUpdateName, 'resolver_03.Mutation.productUpdateName should exist.')
		assert.isOk(resolver_03.Mutation.variantUpdateName, 'resolver_03.Mutation.variantUpdateName should exist.')
		assert.isOk(resolver_03.Subscription, 'resolver_03.Subscription should exist.')
		assert.isOk(resolver_03.Subscription.productNameChanged, 'resolver_03.Subscription.productNameChanged should exist.')
		assert.isOk(resolver_03.Subscription.variantNameChanged, 'resolver_03.Subscription.variantNameChanged should exist.')

		createExecutableSchema = () => makeExecutableSchema({
			typeDefs: schema_03,
			resolvers: resolver_03
		})

		createExecutableSchema()
		assert.doesNotThrow(createExecutableSchema, Error, 'createExecutableSchema should have succeeded.')
	})
	it('#2 IGNORE FOLDER - Should ignore a folder while gluing.', () => {

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
		const { schema, resolver } = glue('./test/graphql/mock_01', { ignore: 'variant/*' })
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
	})
	it('#3 IGNORE ONE FILE - Should ignore a folder while gluing.', () => {
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
		const { schema } = glue('./test/graphql/mock_01', { ignore: '**/variantquery.js' })
		assert.equal(schema.replace(/\n|\s|\t/g, ''), schema_cec82s.replace(/\n|\s|\t/g, ''), '')
	})
	it('#4 IGNORE DIFFERENT FILES - Should ignore a folder while gluing.', () => {
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
		const { schema } = glue('./test/graphql/mock_01', { ignore: ['**/productquery.js', '**/variantquery.js'] })
		assert.equal(schema.replace(/\n|\s|\t/g, ''), schema_cec82ws.replace(/\n|\s|\t/g, ''), '')
	})
	it('#5 COMMENTS - Should be able to manage comments in the schema root.', () => {
		const schemaStr = `
    type Product {
      id: ID!
      name: String!
      shortDescription: String
    }

    type ProductNameChangedMsg {
      id: ID!
      name: String
    }
    # This is a message
    type UpdateMessage {
      message: String!
    }
    # This is
    # a
    # Variant
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

      # ### GET variants
      #
      # _Arguments_
      # - **id**: Variant's id (optional)
      variants(id: Int): [Variant]

      # ### GET products
      #
      # _Arguments_
      # - **id**: Product's id (optional)
      products(id: Int): [Product]

      # ### GET products
      #
      # _Arguments_
      # - **id**: Product's id (optional)
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
		const { schema } = glue('./test/graphql/mock_04')
		assert.equal(schema.replace(/\n|\s|\t/g, ''), schemaStr.replace(/\n|\s|\t/g, ''), '')
	})
	it('#6 TYPESCRIPT SUPPORT - Should support typescript resolvers.', () => {
		const { resolver } = glue('./test/graphql/mock_05', { mode: 'ts' })
		assert.isOk(resolver, 'resolver should exist.')
		assert.isOk(resolver.Query, 'resolver.Query should exist.')
		assert.isOk(resolver.Query.products, 'resolver.Query.products should exist.')
	})
	it('#7 CUSTOM RESOLVER GLOBBING - Should support custom file extensions for resolvers.', () => {
		const { resolver } = glue('./test/graphql/mock_06', { mode: 'product/*.js' })
		assert.isOk(resolver, 'resolver should exist.')
		assert.isOk(resolver.Query, 'resolver.Query should exist.')
		assert.isOk(resolver.Query.products, 'resolver.Query.products should exist.')
		assert.isOk(!resolver.Query.variants, 'resolver.Query.variants should not exist.')
	})
  it('#8 SUPPORT .gql FILES - Should be glue .gql files.', () => {
    const schemaStr = `
    type Product {
      id: ID!
      name: String!
      shortDescription: String
    }

    type ProductNameChangedMsg {
      id: ID!
      name: String
    }
    # This is a message
    type UpdateMessage {
      message: String!
    }
    # This is
    # a
    # Variant
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

      # ### GET variants
      #
      # _Arguments_
      # - **id**: Variant's id (optional)
      variants(id: Int): [Variant]

      # ### GET products
      #
      # _Arguments_
      # - **id**: Product's id (optional)
      products(id: Int): [Product]

      # ### GET products
      #
      # _Arguments_
      # - **id**: Product's id (optional)
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
    const { schema } = glue('./test/graphql/mock_07')
    assert.equal(schema.replace(/\n|\s|\t/g, ''), schemaStr.replace(/\n|\s|\t/g, ''), '')
  })
})