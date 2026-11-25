const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let faq = new Schema({
	languageType:{type:String, default:"english"},
	question:{
		type:String,
		index: true
	},
	answer:{
		type:String,
		required:true,
	},

});
module.exports = mongoose.model('Faq',faq,'Faq');

