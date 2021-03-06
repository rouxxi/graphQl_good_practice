import "dotenv/config";
import cors from 'cors';
import jwt from 'jsonwebtoken';
import express from 'express';
import { ApolloServer, AuthenticationError} from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, {sequelize} from './models/index';

import http from 'http';
import { defaultTypeResolver } from "graphql";

import DataLoader from 'dataloader';
import loaders from './loaders';

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

  const batchUsers = async (keys, models) => {
	const users = await models.User.findAll({
	  where: {
		id: {
		  $in: keys,
		},
	  },
	});
   
	return keys.map(key => users.find(user => user.id === key));
  };

const userLoader = new DataLoader(keys => batchUsers(keys, models))

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
	context: async ({req, connection}) => { //context contient req et response grace au httpServer
		if (connection) {
			return {
			  models,
			};
		  }
	   
		  if (req) {
		const me = await getMe(req);
		
		return {
		models: models,
		me: me, // await models.User.findByLogin('rwieruch'),
		secret: process.env.SECRET,
		//me: models.users[1],
		loaders: {
			user: new DataLoader(keys =>
				loaders.user.batchUsers(keys, models)), // permet d'économiser des requêtes
		  },
	  		}
		}
	}
});

server.applyMiddleware({ app, path: '/graphql' }); //server est un middleware à app sur l'adress /graphql

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);



const isTest = !!process.env.TEST_DATABASE;

// si le force à une valeur à false les donnée vont s'accumuler
sequelize.sync( {force: isTest }).then(async ()=> {

	if(isTest){
		createUsersWithMessages(new Date());
	};

	httpServer.listen({ port: 8000}, () => {
		console.log('Apollo server run on that temrinal on http://localhost:8000/graphql')
	})	
})


const createUsersWithMessages = async (date) => {
	await models.User.create(
	  {
		username: 'rwieruch',
		email: 'hello@robin.com',
		password: 'rwieruch',
		role: 'ADMIN',
		messages: [
		  {
			text: 'Published the Road to learn React',
			createdAt: date.setSeconds(date.getSeconds() + 1),
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
			createdAt: date.setSeconds(date.getSeconds() + 1),
		  },
		  {
			text: 'Published a complete ...',
			createdAt: date.setSeconds(date.getSeconds() + 1),
		  },
		],
	  },
	  {
		include: [models.Message],
	  },
	);
  };
