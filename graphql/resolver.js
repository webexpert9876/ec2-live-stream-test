const QueryResolver = require('./query/queryResolver');
const MutationResolver = require('./mutation/mutationResolver');

// A map of functions which return data for the schema.
const resolvers = {
    Query: QueryResolver,
    Mutation: MutationResolver
};


module.exports = resolvers