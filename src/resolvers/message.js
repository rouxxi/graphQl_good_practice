import {v4 as uuidv4} from 'uuid';

export default {
	Query: {
		messages: (parent, args, {models}) => {
			return Object.values(models.messages)
		},
		message: (parent, {id}, {models}) => {
			return models.messages[id]
		}
	},
	Mutation: {
		createMessage: (parent, {text}, {me, models}) => {
			const id = uuidv4();
			const message = {
				id: id,
				text: text,
				userId: me.id
			};

			models.message[id] = message;
			models.users[me.id].messageIds.push(id);


			return message
		},
	    deleteMessage: (parent, { id },{ models}) => {
			const { [id]: message, ...otherMessages } = models.messages;
	   
			if (!message) {
			  return false;
			}
	   
			models.messages = otherMessages;
	   
			return true;
		  },
	},
	Message: {
		// user: (parent, args, { me }) => {
		// 	return me
		// },
		user: (message, args, {models}) => models.users[message.userId],
	  },
};
