import jwt from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server';
import { isAdmin } from './authorization';
import { combineResolvers } from 'graphql-resolvers';

const createToken = async (user, secret, expiresIn ) => {
	const { id, email, username, role } = user;
  	return await jwt.sign({ id, email, username, role }, secret, {
		expiresIn,
	  });
  };

export default {
	Query: {
		me: async (parent, args, { models, me }) => {
			if(!me){
				return null;
			}
			return await models.User.findByPk(me.id);
		  },
		user: async (parent, { id }, {models}) => {
			  return await models.User.findByPk(id);
		},
		users: async  (parent, args, {models})=> {
			return await models.User.findAll();
		},
	},
	Mutation: {
		signUp: async (
		  parent,
		  { username, email, password },
		  { models, secret },
		) => {
		  const user = await models.User.create({
			username,
			email,
			password,
		  });
	 
		  return { token: createToken(user, secret, '30m') };
		},
		signIn:async (
			parent,
			{ login, password },
			{ models, secret },
		  ) => {
			const user = await models.User.findByLogin(login);
	   
			if (!user) {
			  throw new UserInputError(
				'No user found with this login credentials.',
			  );
			}
	   
			const isValid = await user.validatePassword(password);
	   
			if (!isValid) {
			  throw new AuthenticationError('Invalid password.');
			}
	   
			return { token: createToken(user, secret, '30m') };
		  },

		  deleteUser: combineResolvers(
			isAdmin,
			async (parent, { id }, { models }) => {
			  return await models.User.destroy({
				where: { id },
			  });
			},
		  )
		//   deleteUser: async (parent, { id }, { models }) => {
		// 	return await models.User.destroy({
		// 	  where: { id },
		// 	});
		//   },
	  },
	// User: {
	// 	username: user => `${user.username}`,
	//   },
	User: {
		messages: async (user, args, {models}) => {
		  return await models.Message.findAll({
			  where:{
				  userId: user.id,
			  }
			})
		},
	  },

};
