exports.query = `
  # ### GET variants
  #
  # _Arguments_
  # - **id**: Variant's id (optional)
  variants(id: Int): [Variant]
`