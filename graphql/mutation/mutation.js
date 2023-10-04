const mutationSchema = `

  type Mutation {
    createStudent(firstName:String,lastName:String):String
  }
`;

module.exports = mutationSchema;