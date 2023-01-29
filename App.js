const { urlencoded } = require('express');
const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");
const crypto = require("crypto");
const port = process.env.PORT || 5000;
require("dotenv").config();

const bcrypt = require('bcrypt');


const { connectMongoose, User } = require("./Database.js");


connectMongoose();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



app.get("/", (req, res) => {
  res.send("This is home page");
});


app.post("/users", async (req, res) => {
  const { email, password, username } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  User.findOne({ email: email }, (err, user) => {
    if (user) {
      res.send({ message: "User already registered" })
    } else {
      const user = new User({
        email,
        username,
        password: hashPassword,
      })
      user.save(async(err) => {
        if (err) {
          console.log("This is an error")
          res.send(err);
        } else {
          const user = { email: email, password: password };
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

          await User.updateOne({ email: email }, { $set: { token: accessToken } });

          res.json({ accessToken: accessToken });
        }
      })
    }
  });




});

app.get('/users/:username', async (req, res) => {
  const { username } = req.params;
  var dbarray = {}
  await User.find({ username: username })
    .then((result) => {
      dbarray = result;
    })
    .catch((err) => {
      console.log(err);
    })
  res.send({ message: dbarray });

})

const validateToken = (req, res, next) => {
  // console.log(req.headers)
  const bearerHeader = req.headers['authorization'];
  if (bearerHeader === undefined) {
    res.send({ message: "Token is not valid" });
  }
  const bearer = bearerHeader.split(' ');
  const token = bearer[1];
  // console.log(token)
  req.token = token;
  next();
}

app.get("/users/:username/followers", validateToken, async (req, res) => {
  const { username } = req.params;
  let secretKey = process.env.ACCESS_TOKEN_SECRET;

  let var1;
  jwt.verify(req.token, secretKey, (err, auth) => {
    if (err) {
      var1 = "invalid";
    }
    else {
      var1 = auth;
    }
  });
  if (var1 === "invalid") {
    res.send({ message: "Invalid Token" });
  }
  else {
   


    var dbarray = {}
    await User.find({ username: username })
      .then((result) => {
        dbarray = result;
      })
      .catch((err) => {
        console.log(err);
      })


    res.send({ message: dbarray[0].no_of_followers });
  }



});

app.get("/users/:username/following", validateToken, async (req, res) => {
  const { username } = req.params;
  let secretKey = process.env.ACCESS_TOKEN_SECRET;

  let var1;
  jwt.verify(req.token, secretKey, (err, auth) => {
    if (err) {
      var1 = "invalid";
    }
    else {
      var1 = auth;
    }
  });
  if (var1 === "invalid") {
    res.send({ message: "Invalid Token" });
  }
  else {
    

    var dbarray = {}
    await User.find({ username: username })
      .then((result) => {
        dbarray = result;
      })
      .catch((err) => {
        console.log(err);
      })


    res.send({ message: dbarray[0].no_of_followings });
  }



});

app.post("/users/:username/follow", validateToken, async (req, res) => {
  const { username } = req.params;
  let secretKey = process.env.ACCESS_TOKEN_SECRET;

  let var1;
  jwt.verify(req.token, secretKey, (err, auth) => {
    if (err) {
      var1 = "invalid";
    }
    else {
      var1 = auth;
    }
  });
  if (var1 === "invalid") {
    res.send({ message: "Invalid Token" });
  }
  else {
    const { email } = var1;


    var dbarray = {}
    await User.find({ username: username })
      .then((result) => {
        dbarray = result;
      })
      .catch((err) => {
        console.log(err);
      })
    let initialArray = [];
    if (dbarray[0].no_of_followers === undefined) {
      initialArray.push(email);

    }
    else {
      initialArray = dbarray[0].no_of_followers;
      initialArray.push(email);
    }



    await User.updateOne({ username: username }, { $set: { no_of_followers: initialArray } });

    dbarray = []
    await User.find({ email: email })
      .then((result) => {
        dbarray = result;
      })
      .catch((err) => {
        console.log(err);
      })
    initialArray = [];
    if (dbarray[0].no_of_followings === undefined) {
      initialArray.push(username);

    }
    else {
      initialArray = dbarray[0].no_of_followings;
      initialArray.push(username);
    }

    await User.updateOne({ email: email }, { $set: { no_of_followings: initialArray } });

    res.send({ message: "Username has been followed" });
  }



});


app.delete('/users/:username/follow', validateToken, async (req, res) => {
  const { username } = req.params;
  let secretKey = process.env.ACCESS_TOKEN_SECRET;

  let var1;
  jwt.verify(req.token, secretKey, (err, auth) => {
    if (err) {
      var1 = "invalid";
    }
    else {
      var1 = auth;
    }
  });
  if (var1 === "invalid") {
    res.send({ message: "Invalid Token" });
  }
  else {
    const { email } = var1;
    var dbarray = [];
    await User.find({ username: username })
      .then((result) => {
        dbarray = result;
      })
      .catch((err) => {
        console.log(err);
      })
    let initialArray = dbarray[0].no_of_followers;
    let index = initialArray.indexOf(email);
    if (index > -1) {
      initialArray.splice(index, 1);
    }


    await User.updateOne({ username: username }, { $set: { no_of_followers: initialArray } });


    dbarray = [];
    await User.find({ email: email })
      .then((result) => {
        dbarray = result;
      })
      .catch((err) => {
        console.log(err);
      })
    initialArray = dbarray[0].no_of_followings;
    index = initialArray.indexOf(username);
    if (index > -1) {
      initialArray.splice(index, 1);
    }


    await User.updateOne({ email: email }, { $set: { no_of_followings: initialArray } });

    res.send({ message: "Username has been unfollowed" });
  }

});
























app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})