var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    host: 'imap.googlemail.com',
	port: 993,
    auth: {
        user: 'credifina1@gmail.com',
        pass: 'ddrogba1'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Miaou', // sender address
    to: 'elamranie.info@gmail.com', // list of receivers
    subject: 'Va te faire sodomiser', // Subject line
    text: 'Tout est dans le titre', // plaintext body
    html: '<b>Tout est dans le titre</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});