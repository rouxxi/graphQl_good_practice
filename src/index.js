import "dotenv/config";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import express from 'express';
import { ApolloServer, AuthenticationError} from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, {sequelize} from './models/index';


const app = express();

app.use(cors(
	{
		origin: "*"
	}
))

const getMe = async req => {
	const token = req.headers['x-token'];
   
	if (token) {
	  try {
		return await jwt.verify(token, process.env.SECRET);
	  } catch (e) {
		throw new AuthenticationError(
		  'Your session expired. Sign in again.',
		);
	  }
	}
  };



const server = new ApolloServer({
	typeDefs: schema, //type définition
	resolvers: resolvers, //used for return data from fields from the schema
	formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
 
    return {
      ...error,
      message,
    };	},
	context: async () => {
		const me = await getMe(req);
		
		return {
		models: models,
		me: me, // await models.User.findByLogin('rwieruch'),
		secret: process.env.SECRET,
		//me: models.users[1],
	  		}
	}
});

server.applyMiddleware({ app, path: '/graphql' });


const eraseDatabaseOnSync = true;
// si le force à une valeur à false les donnée vont s'accumuler
sequelize.sync( {force: eraseDatabaseOnSync }).then(async ()=> {

	if(eraseDatabaseOnSync){
		createUsersWithMessages();
	};

	app.listen({ port: 8000}, () => {
		console.log('Apollo server run on that temrinal on http://localhost:8000/graphql')
	})	
})


const createUsersWithMessages = async () => {
	await models.User.create(
	  {
		username: 'rwieruch',
		email: 'hello@robin.com',
		password: 'rwieruch',
		role: 'ADMIN',
		messages: [
		  {
			text: 'Published the Road to learn React',
		  },
		],
	  },
	  {
		include: [models.Message], // what is that
	  },
	);
   
	await models.User.create(
	  {
		username: 'ddavids',
		email: 'hello@david.com',
		password: 'ddavids',
		messages: [
		  {
			text: 'Happy to release ...',
		  },
		  {
			text: 'Published a complete ...',
		  },
		],
	  },
	  {
		include: [models.Message],
	  },
	);
  };
