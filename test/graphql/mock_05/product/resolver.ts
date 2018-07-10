const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }]

exports.resolver = {
	Query: {
		products(root, { id }) {
			const results = id ? productMocks.filter(p => p.id == id) : productMocks
			if (results)
				return results
			else
				throw new Error(`Product with id ${id} does not exist.`)
		}
	},
}