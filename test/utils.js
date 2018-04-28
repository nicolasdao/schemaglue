/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const { assert } = require('chai')
const { removeComments, findClosingCharacter, getSchemaParts, mergeSchemas } = require('../src/utils')

describe('utils', () => {
	describe('removeComments', () => 
		it('Should replace comments in a GraphQl schema with tokens.', () => {

			const schema = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type ProductNameChangedMsg {
				id: ID! # Some random comments to make things more interesting ## fec #c ce
				name: String
			}

			type Mutation {
				# ### Update a product's name
				#
				# _Arguments_
				# - **id**: Product's id
				# - **name**: New product's name
				productUpdateName(id: Int, name: String): UpdateMessage # dewdwed Bala
			}

			type Subscription {
				# ### Listen for product's name changes
				#
				# _Arguments_
				# - **id**: Product's id
				productNameChanged(id: Int): ProductNameChangedMsg
			}`

			const answer = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type ProductNameChangedMsg {
				id: ID!
				name: String
			}

			type Mutation {
				productUpdateName(id: Int, name: String): UpdateMessage
			}

			type Subscription {
				productNameChanged(id: Int): ProductNameChangedMsg
			}`

			const result = removeComments(schema)
			const noCommentsSchema = result.tokens.reduce((s,token) => s.replace(token.value, ''), result.schema)
			assert.equal(noCommentsSchema.replace(/\n|\s|\t/g, ''), answer.replace(/\n|\s|\t/g, ''))
		}))
	describe('findClosingCharacter', () => 
		it('Should find the index of the closing character of a predefined block of code.', () => {
			const str = `
				const fn = () => {
					const a = {
						hello: 'world',
						user: {
							name: 'Nic',
							age: 36
						}
					}
					console.log(a)
				}
				console.log('Function created')

				fn()`

			const skipPattern_01 = 'const fn = () => {'
			const start_01 = str.indexOf(skipPattern_01) + skipPattern_01.length
			const result_01 = findClosingCharacter(str, '{', '}')
			assert.equal(str.slice(result_01+1).replace(/\n|\s|\t/g, ''), `
				console.log('Function created')
				fn()
				`.replace(/\n|\s|\t/g, ''), 'Issue with result_01_A')
			assert.equal(str.slice(start_01-1, result_01+1).replace(/\n|\s|\t/g, ''), `
				{
					const a = {
						hello: 'world',
						user: {
							name: 'Nic',
							age: 36
						}
					}
					console.log(a)
				}
				`.replace(/\n|\s|\t/g, ''), 'Issue with result_01_B')

			const skipPattern_02 = 'const a = {'
			const start_02 = str.indexOf(skipPattern_02) + skipPattern_02.length
			const result_02 = findClosingCharacter(str, '{', '}', start_02-1)
			assert.equal(str.slice(start_02-1, result_02+1).replace(/\n|\s|\t/g, ''), `
				{
					hello: 'world',
					user: {
						name: 'Nic',
						age: 36
					}
				}
				`.replace(/\n|\s|\t/g, ''), 'Issue with result_02')
		}))

	describe('getSchemaParts', () => 
		it('Should break down a GraphQl schema.', () => {
			const schema = 
			`type Mutation { # some nasty comment }
				# ### Update a product's name
				#
				# _Arguments_
				# - **id**: Product's id
				# - **name**: New product's name
				productUpdateName(id: Int, name: String): UpdateMessage 
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


			type Subscription	{
				# ### Listen for product's name changes
				#
				# _Arguments_
				# - **id**: Product's id
				productNameChanged(id: Int): ProductNameChangedMsg
			}`

			const types = `
			type Product {
				id: ID!
				name: String!
				shortDescription: String
			}

			type ProductNameChangedMsg {
				id: ID!
				name: String
			}`

			const mutation = `
				# some nasty comment }
				# ### Update a product's name
				#
				# _Arguments_
				# - **id**: Product's id
				# - **name**: New product's name
				productUpdateName(id: Int, name: String): UpdateMessage`

			const subscription = `
				# ### Listen for product's name changes
				#
				# _Arguments_
				# - **id**: Product's id
				productNameChanged(id: Int): ProductNameChangedMsg`

			const result = getSchemaParts(schema)

			assert.equal(result.types.body.replace(/\n|\s|\t/g, ''), types.replace(/\n|\s|\t/g, ''))
			assert.equal(result.mutation.body.replace(/\n|\s|\t/g, ''), mutation.replace(/\n|\s|\t/g, ''))
			assert.equal(result.subscription.body.replace(/\n|\s|\t/g, ''), subscription.replace(/\n|\s|\t/g, ''))
		}))

	describe('mergeSchemas', () => 
		it('Should merge multiple GraphQl schemas into one.', () => {
			const schemas = [
				`
			type UpdateMessage {
				message: String!
			}
			`,
				`
			type Query {
				# ### GET products
				#
				# _Arguments_
				# - **id**: Product's id (optional)
				products(id: Int): [Product]
			}`, 
				`
			type Product {
			  id: ID!
			  name: String!
			  shortDescription: String
			}

			type ProductNameChangedMsg {
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
			}

			type Subscription {
			  # ### Listen for product's name changes
			  #
			  # _Arguments_
			  # - **id**: Product's id
			  productNameChanged(id: Int): ProductNameChangedMsg
			}
			`,`
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
			  # ### Update a variant's name
			  #
			  # _Arguments_
			  # - **id**: Variant's id
			  # - **name**: New variant's name
			  variantUpdateName(id: Int, name: String): UpdateMessage
			}

			type Subscription {
			  # ### Listen for variant's name changes
			  #
			  # _Arguments_
			  # - **id**: Variant's id
			  variantNameChanged(id: Int): VariantNameChangedMsg
			}`,
				`type Query {
			  # ### GET variants
			  #
			  # _Arguments_
			  # - **id**: Variant's id (optional)
			  variants(id: Int): [Variant]
			}`]

			const mergedSchema = `
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
			}
			`
			assert.equal(mergeSchemas(...schemas).replace(/\n|\s|\t/g, ''), mergedSchema.replace(/\n|\s|\t/g, ''))
		}))
})



