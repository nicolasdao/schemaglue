exports.resolver = context => {
	return {
		Query: {
			products(root, { id }) {
				const { GetProducts } = context
				return GetProducts(id)
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
}