import "dotenv/config";
import cors from 'cors';
import express from 'express';
import { ApolloServer} from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, {sequelize} from './models/index';

const app = express();

app.use(cors(
	{
		origin: "*"
	}
))


const server = new ApolloServer({
	typeDefs: schema, //type définition
	resolvers: resolvers, //used for return data from fields from the schema
	context: {
		models: models,
		//me: models.users[1],
	  },
});

server.applyMiddleware({ app, path: '/graphql' });

sequelize.sync().then(async ()=> {
	app.listen({ port: 8000}, () => {
		console.log('Apollo server run on that temrinal on http://localhost:8000/graphql')
	
	})
	
})
