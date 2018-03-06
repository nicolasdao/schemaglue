exports.schema = `
type Product {
  id: ID!
  name: String!
  shortDescription: String
}

type ProductNameChangedMsg {
	id: ID!
	name: String
}
`
// Notice that we have omitted to wrap the above with 'type Query { }'
exports.mutation =`
  # ### Update a product's name
  #
  # _Arguments_
  # - **id**: Product's id
  # - **name**: New product's name
  productUpdateName(id: Int, name: String): UpdateMessage
`

exports.subscription =`
  # ### Listen for product's name changes
  #
  # _Arguments_
  # - **id**: Product's id
  productNameChanged(id: Int): ProductNameChangedMsg
`