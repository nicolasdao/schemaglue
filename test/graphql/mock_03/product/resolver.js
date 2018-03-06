const productMocks = [{ id: 1, name: 'Product A', shortDescription: 'First product.' }, { id: 2, name: 'Product B', shortDescription: 'Second product.' }]

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

	Mutation: {
		productUpdateName(root, { id, name }) {
			return { message: `Updating product (id ${id}) with name ${name} successful` }
		}
	},

	Subscription: {
		productNameChanged(root, { id }) {
			return { id: id, name: 'some name' }
		}
	}
}