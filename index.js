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
const { getSchemaParts } = require('./src/utils')

/*eslint-disable */
const CWD = process.cwd()
/*eslint-enable */

const getAppConfig = () => {	
	const appconfigPath = path.join(CWD, 'appconfig.json')
	return fs.existsSync(appconfigPath) ? require(appconfigPath) : null
}


// [description]
// @param  {String} 		schemaFolderPath 	Path to the root folder containing the schema.graphql and resolver files.
// @param  {Object} 		options          	Options object.
// @param  {String|Array} 	options.ignore      Defines globbing patterns to ignore certain files or folders (e.g., ignore: ['**/productquery.js', '**/variantquery.js'], ignore: ignore: 'variant/*').
// @param  {String} 		options.mode 		Defines whether the GraphQL resolvers are defined using standard javascript files, typescript files or a custom globbing pattern. 
// 												Valid values: 'js', 'ts', '<globbing pattern>'	
// @param  {any}    		options.context    	Passed in as the argument to resolvers exported as functions (e.g. { context: { databaseConnection } }).
// @return {Object}         result
// @return {String}         result.schema 		Aggregated string made of all the schemas defined in the various .graphql files under folder located at 'schemaFolderPath'
// @return {Object}         result.resolve   	Aggregated object made of all the resolvers defined in the various .graphql files under folder located at 'schemaFolderPath'
//
const glue = (schemaFolderPath, options={}) => {
	let schemaPathInConfig = null
	let ignore = null
	let resolverFileGlob = 
		!options.mode || options.mode == 'js' ? '**/*.js' :
			options.mode == 'ts' ? '**/*.ts' : options.mode

	if (!schemaFolderPath) {
		const appconfig = getAppConfig()
		const graphql = (appconfig || {}).graphql
		schemaPathInConfig = (graphql || {}).schema
		ignore = (graphql || {}).ignore
	}
	const resolverFiles = path.join(schemaFolderPath || schemaPathInConfig || 'schema', resolverFileGlob)
	const schemaGraphQlFiles = path.join(schemaFolderPath || schemaPathInConfig || 'schema', '**/*.graphql')
	const optionIgnore = options.ignore || ignore
	const ignored = optionIgnore
		? typeof(optionIgnore) == 'string'
			? path.join(schemaFolderPath || schemaPathInConfig || 'schema', optionIgnore) 
			: optionIgnore.map(i => path.join(schemaFolderPath || schemaPathInConfig || 'schema', i))
		: undefined

	const jsFiles = glob.sync(resolverFiles, { ignore: ignored }) || []
	const graphqlFiles = glob.sync(schemaGraphQlFiles, { ignore: ignored }) || []
	const modules = jsFiles.map(f => require(path.join(CWD, f)))
	modules.push(...graphqlFiles.map(f => {
		const parts = getSchemaParts(fs.readFileSync(path.join(CWD, f), 'utf8'))
		if (!parts)
			return null
		else
			return {
				schema: parts.types ? parts.types.body : null,
				resolver: null,
				query: parts.query ? parts.query.body : null,
				mutation: parts.mutation ? parts.mutation.body : null,
				subscription: parts.subscription ? parts.subscription.body : null
			}
	}).filter(x => x))
	const gluedSchema = (modules || []).reduce((a, { schema, resolver, query, mutation, subscription }) => {
		const s = schema && typeof(schema) == 'string' ? (a.schema + '\n' + schema).trim() : a.schema
		const q = query && typeof(query) == 'string' ? (a.query + '\n' + query).trim() : a.query
		const m = mutation && typeof(mutation) == 'string' ? (a.mutation + '\n' + mutation).trim() : a.mutation
		const sub = subscription && typeof(subscription) == 'string' ? (a.subscription + '\n' + subscription).trim() : a.subscription
		const expandedResolver = typeof(resolver) == 'function' ? resolver(options.context) : resolver

		for(let key in expandedResolver)
			a.resolver[key] = Object.assign((a.resolver[key] || {}), (expandedResolver[key] || {}))
		return { schema: s, resolver: a.resolver, query: q, mutation: m, subscription: sub } 
	}, { schema: '', resolver: {}, query: 'type Query {', mutation: 'type Mutation {', subscription: 'type Subscription {' })

	if (!gluedSchema.schema) {
		if (schemaPathInConfig)
			throw new Error(`Missing GraphQL Schema: No schemas found under the path '${path.join(CWD, schemaPathInConfig)}' defined in the appconfig.json`)
		else if (schemaFolderPath)
			throw new Error(`Missing GraphQL Schema: No schemas found under the path '${path.join(CWD, schemaFolderPath)}'`)
		else
			throw new Error(`Missing GraphQL Schema: No schemas found under the path '${path.join(CWD, 'schema')}'`)
	}

	if (gluedSchema.query != 'type Query {') {
		gluedSchema.query = gluedSchema.query + '\n}'
		gluedSchema.schema = gluedSchema.schema + '\n' + gluedSchema.query
	}
	if (gluedSchema.mutation != 'type Mutation {') {
		gluedSchema.mutation = gluedSchema.mutation + '\n}'
		gluedSchema.schema = gluedSchema.schema + '\n' + gluedSchema.mutation
	}
	if (gluedSchema.subscription != 'type Subscription {') {
		gluedSchema.subscription = gluedSchema.subscription + '\n}'
		gluedSchema.schema = gluedSchema.schema + '\n' + gluedSchema.subscription
	}

	return { schema: gluedSchema.schema, resolver: gluedSchema.resolver }
}

module.exports = glue




