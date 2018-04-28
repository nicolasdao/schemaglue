/**
 * Copyright (c) 2018, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const shortid = require('shortid')

const newShortId = () => shortid.generate().replace(/-/g, 'r').replace(/_/g, '9')

/**
 * Replace comments with unique tokens
 * 
 * @param  {String} schema 			GraphQl schema
 * @return {String} result.schema 	Tokenized schema
 * @return {Array} 	result.tokens 	Array of tokens -> { comment: String, value: String }
 */
const removeComments = schema => {
	if (!schema)
		return schema
	if (typeof(schema) != 'string')
		throw new Error(`Wrong argument exception. 'schema' must be a string (current type: ${typeof(schema)}).`)

	const sanitizedSchema = schema + '\n'
	const commentRegEx = /#.*\n/
	let noMoreComments = false
	let result = { schema: sanitizedSchema, tokens:[] }
	while (!noMoreComments) {
		const comment = (result.schema.match(commentRegEx) || [])[0]
		if (comment) {
			const commentToken = `__${newShortId()}__`
			result.schema = result.schema.replace(commentRegEx, `${commentToken}\n`)
			result.tokens.push({ comment: comment.replace(/^\n|\n$/g,''), value: commentToken })
		} else
			noMoreComments = true
	}

	result.schema = result.schema.replace(/^\n|\n$/g,'')

	return result
}

const replaceTokens = (schema, tokens=[]) => {
	if (tokens.length == 0)
		return schema

	return tokens.reduce((s, token) => s.replace(token.value, token.comment), schema)
}

const findClosingCharacter = (str, openChar, closingChar, skip=0) => {
	if (!openChar)
		throw new Error('Missing required argument \'openChar\'.')
	if (!closingChar)
		throw new Error('Missing required argument \'closingChar\'.')
	if (openChar == closingChar)
		throw new Error(`Invalid argument exception. 'openChar' and 'closingChar' cannot be equal (current value: ${openChar}).`)

	if (!str)
		return -1

	const chars = Array.from(str.slice(skip))
	let openPos = -1
	for (let i=0;i<chars.length;i++) {
		const c = chars[i]
		// Found closing char
		if (c == closingChar) {
			// Found THE closing char
			if (openPos == 0)
				return skip + i
			// Closing the current block and carry on closing the next one
			else
				openPos--

		}
		// Found opening char
		else if (c == openChar)
			openPos++
	}

	return -1
}

/**
 * Break downs GraphQl string schema
 * 
 * @param  {String} schema  				GraphQl schema
 * @return {Object} result.types    		{ raw: String, body: String }
 * @return {Object} result.query    		{ raw: String, body: String }
 * @return {Object} result.mutation    		{ raw: String, body: String }
 * @return {Object} result.subscription    	{ raw: String, body: String }
 */
const getSchemaParts = schema => {
	if (!schema)
		return null
	const { schema:sanitizedSchema, tokens } = removeComments(schema)
	const schemaLength = sanitizedSchema.length + 2

	return [
		{ key: 'query', regEx: /\n\s*type\s+Query\s*{/ },
		{ key: 'mutation', regEx: /\n\s*type\s+Mutation\s*{/ },
		{ key: 'subscription', regEx: /\n\s*type\s+Subscription\s*{/ },
		{ key: 'types' }]
		.reduce((acc, v) => {
			if (v.key == 'types') {
				const raw = replaceTokens(acc.schema.replace(/^\n*|\n*$/g, ''), tokens)
				acc.result.types = { raw, body: raw }
			}
			else {
				const match = acc.schema.match(v.regEx)
				if (match) {
					const startIdx = match.index
					const endIdx = findClosingCharacter(acc.schema, '{', '}', startIdx)
					// Save subscription
					const raw = replaceTokens(acc.schema.slice(startIdx+1, endIdx+1).replace(/^\n*|\n*$/g, ''), tokens)
					// Remove match from schema
					acc.schema = acc.schema.slice(0, startIdx) + acc.schema.slice(endIdx+1, schemaLength)
					acc.result[v.key] = {
						raw,
						body: raw.replace(/.*{|}$/g,'')
					}
				}
			}
			return acc
		}, { 
			schema: '\n' + sanitizedSchema + '\n',  
			result: {
				types: null,
				query: null,
				mutation: null,
				subscription: null
			}
		}).result
}

const mergeSchemas = (...schemas) => {
	if (schemas.length == 0)
		return ''

	const result = schemas.reduce((acc, schema) => {
		const parts = getSchemaParts(schema)
		if (parts.types)
			acc.types += ((acc.types ? '\n' : '') + parts.types.body)
		if (parts.query)
			acc.query += ((acc.query ? '\n' : '') + parts.query.body)
		if (parts.mutation)
			acc.mutation += ((acc.mutation ? '\n' : '') + parts.mutation.body)
		if (parts.subscription)
			acc.subscription += ((acc.subscription ? '\n' : '') + parts.subscription.body)
		return acc
	}, { types: '', query: '', mutation:'', subscription:'' })

	let mergedSchema = result.types
	if (result.query) 
		mergedSchema += ((mergedSchema ? '\n' : '') + 'type Query {\n' + result.query + '\n}')
	if (result.mutation)
		mergedSchema += ((mergedSchema ? '\n' : '') + 'type Mutation {\n' + result.mutation + '\n}')
	if (result.subscription)
		mergedSchema += ((mergedSchema ? '\n' : '') + 'type Subscription {\n' + result.subscription + '\n}')

	return mergedSchema
}

module.exports = {
	removeComments,
	findClosingCharacter,
	getSchemaParts,
	mergeSchemas
}












