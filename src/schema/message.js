import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    """ messages(cursor: String, limit: Int): [Message!]! permet de créer des page qui "vite de tout dl"""
    messages(cursor: String, limit: Int): MessageConnection! """ version upgrade """ 
    message(id: ID!): Message!
  }
  extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
  }

  type MessageConnection {
    edges: [Message!]!
    pageInfo: PageInfo!
  }
 
  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Message {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
  }
`;