const variantMocks = [{ id: 1, name: 'Variant A', shortDescription: 'First variant.' }, { id: 2, name: 'Variant B', shortDescription: 'Second variant.' }]

exports.resolver = {
	Query: {
		variants(root, { id }) {
			const results = id ? variantMocks.filter(p => p.id == id) : variantMocks
			if (results)
				return results
			else
				throw new Error(`Variant with id ${id} does not exist.`)
		}
	},

	Mutation: {
		variantUpdateName(root, { id, name }) {
			return { message: `Updating variant (id ${id}) with name ${name} successful` }
		}
	},

	Subscription: {
		variantNameChanged(root, { id }) {
			return { id: id, name: 'some name' }
		}
	}
}