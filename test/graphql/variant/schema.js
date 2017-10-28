exports.schema = `
type Variant {
  id: ID!
  name: String!
  shortDescription: String
}

type VariantNameChangedMsg {
	id: ID!
	name: String
}
`
// Notice that we have omitted to wrap the above with 'type Query { }'

exports.mutation =`
  # ### Update a variant's name
  #
  # _Arguments_
  # - **id**: Variant's id
  # - **name**: New variant's name
  variantUpdateName(id: Int, name: String): UpdateMessage
`

exports.subscription =`
  # ### Listen for variant's name changes
  #
  # _Arguments_
  # - **id**: Variant's id
  variantNameChanged(id: Int): VariantNameChangedMsg
`