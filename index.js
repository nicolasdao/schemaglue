/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const path = require('path')
const fs = require('fs')
const glob = require('glob')

const getWebConfig = () => {	
	/*eslint-disable */
	const webconfigPath = path.join(process.cwd(), 'webconfig.json')
	/*eslint-enable */
	return fs.existsSync(webconfigPath) ? require(webconfigPath) : null
}

const glue = () => {
	const webconfig = getWebConfig()
	const graphql = (webconfig || {}).graphql
	const schemaPathInConfig = (graphql || {}).schema
	const schemaFolder = path.join(schemaPathInConfig || 'schema', '**/*.js')
	const files = glob.sync(schemaFolder)
	/*eslint-disable */
	const modules = (files || []).map(f => require(path.join(process.cwd(), f)))
	/*eslint-enable */
	const gluedSchema = (modules || []).reduce((a, { schema, resolver, query, mutation }) => {
		const s = schema && typeof(schema) == 'string' ? (a.schema + '\n' + schema).trim() : a.schema
		const q = query && typeof(query) == 'string' ? (a.query + '\n' + query).trim() : a.query
		const m = mutation && typeof(mutation) == 'string' ? (a.mutation + '\n' + mutation).trim() : a.mutation
		for(let key in resolver) 
			a.resolver[key] = Object.assign((a.resolver[key] || {}), (resolver[key] || {}))
		return { schema: s, resolver: a.resolver, query: q, mutation: m } 
	}, { schema: '', resolver: {}, query: 'type Query {', mutation: 'type Mutation {' })

	if (!gluedSchema.schema) {
		if (schemaPathInConfig)
			/*eslint-disable */
			throw new Error(`Missing GraphQL Schema: No schemas found under the path '${path.join(process.cwd(), schemaPathInConfig)}' defined in the webconfig.json`)
			/*eslint-enable */
		else
			/*eslint-disable */
			throw new Error(`Missing GraphQL Schema: No schemas found under the path '${path.join(process.cwd(), 'schema')}'`)
			/*eslint-enable */
	}

	if (gluedSchema.query != 'type Query {') {
		gluedSchema.query = gluedSchema.query + '\n}'
		gluedSchema.schema = gluedSchema.schema + '\n' + gluedSchema.query
	}
	if (gluedSchema.mutation != 'type Mutation {') {
		gluedSchema.mutation = gluedSchema.mutation + '\n}'
		gluedSchema.schema = gluedSchema.schema + '\n' + gluedSchema.mutation
	}

	return { schema: gluedSchema.schema, resolver: gluedSchema.resolver }
}

exports.glue = glue




