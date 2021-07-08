export default {
	Query: {
		me: (parent, args, { me }) => {
			return me;
		  },
		user: (parent, { id }, {models}) => {
			  return models.users[id];
		},
		users: (parent, args, {models})=> {
			return Object.values(models.users);
		},
	},

	// User: {
	// 	username: user => `${user.username}`,
	//   },
	User: {
		messages: (user, args, {models}) => {
		  return Object.values(models.messages).filter(
			message => message.userId === user.id,
		  );
		},
	  },

};
