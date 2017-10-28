exports.query = `
  # ### GET products
  #
  # _Arguments_
  # - **id**: Product's id (optional)
  products(id: Int): [Product]
`