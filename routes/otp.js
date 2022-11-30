var express = require('express');
var router = express.Router();
var otpController = require('../controllers/otp');

router.post('/send-mart-sms', function(req, res, next) {
  var phoneNumber = req.body.phoneNumber;
  var message = req.body.message;

  otpController.sendMessageToPhone(res, next, phoneNumber, message);
});

module.exports = router;
