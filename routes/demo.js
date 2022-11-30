var express = require("express");
var router = express.Router();

var userPassword = "123456";
var token = "111111";
var userInfo = {
  _id: "1",
  phone: "0123456789",
  name: "Mark Henry",
};

var debitCardInfo = {
  _id: "2",
  ownerName: userInfo.name,
  cardNumber: "5647341124132020",
  expireDate: '12/20',
  cvv: "456",
  currentWeeklySpendingValue: 0,
  isOnWeeklySpendingLimit: false,
  weeklySpendingLimit: 5000,
  availableBalance: 10000,
  currency: 'S$',
}

var debitCardActionsData = [
  {
    key: 'top_up_account',
    label: 'Top-up account',
    text: 'Deposit money to your account to use with card',
  },
  {
    key: 'weekly_spending_limit',
    label: 'Weekly spending limit',
    text: 'You haven’t set any spending limit on card',
  },
  {
    key: 'freeze_card',
    label: 'Freeze card',
    text: 'Your debit card is currently active',
  },
  {
    key: 'get_a_new_card',
    label: 'Get a new card',
    text: 'This deactivates your current debit card',
  },
  {
    key: 'deactivated_cards',
    label: 'Deactivated cards',
    text: 'Your previously deactivated cards',
  },
]

router.post("/login", function (req, res, next) {
  var phone = req.body.phone;
  var password = req.body.password;
  if (phone !== userInfo.phone || password !== userPassword) {
    res.status(500).json({ success: false });
  } else {
    res.json({ ...userInfo, token });
  }
});

router.get("/self", function (req, res, next) {
  res.json({ ...userInfo, token });
});

router.get("/debit-card-actions", function (req, res, next) {
  res.json(debitCardActionsData);
});

router.get("/debit-card-info", function (req, res, next) {
  res.json(debitCardInfo);
});

router.patch("/toggle-weekly-spending-limit", function (req, res, next) {
  var isOn = req.body.isOn;
  debitCardInfo.isOnWeeklySpendingLimit = isOn;
  res.json(debitCardInfo);
});

router.patch("/update-weekly-spending-limit", function (req, res, next) {
  var limit = req.body.limit;
  debitCardInfo.weeklySpendingLimit = limit;
  debitCardInfo.isOnWeeklySpendingLimit = true;
  debitCardInfo.currentWeeklySpendingValue = 1200;
  res.json(debitCardInfo);
});

router.get("/weekly-spending-limit-suggestions", function (req, res, next) {
  res.json([5000, 10000, 20000]);
});

module.exports = router;
