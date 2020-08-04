var express = require("express");
var mysql = require("mysql");
//const mongoose=require("mongoose");
const ejs=require("ejs");


var app = express();

//sql connection
var path = require("path"),
    flash = require("connect-flash"),
    session = require("express-session"),
    bodyparser = require("body-parser");


var Connection = mysql.createConnection({
    port:"3306",
    host: "localhost",
    user: "root",
    password: "'password'",
  database: "safety_check",
  multipleStatements: true,
    // debug:true
});

Connection.connect(function(err) { if (err) throw err; console.log("Connected!"); });

//using express session
app.use(require("express-session")({
    secret: "Rupasnhu is good!", //later used to decode
    resave: false, //always needed
    saveUninitialized: false //always needed
}));
app.use(flash());
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));


//mongoose.connect("mongodb://localhost:27017/safety_checkDB",{ userNewUrlParser:true});


//SQL database




//mongoDB databse now.
// const diseases={
//   symptoms: String,
//   patient_email:String,
//   patient_details:[patients]
// };
//
//
// const table shops={
//     shop_no:Integer,
//     customer_email: String,
//      travel_history:Boolean,
//      shop_details:[shop_register],
//      patient_details:[patients]
//     };
//
// const shop_register={
//   shop_id :Integer,
//   shop_name : String
// };
//
// const patients{
//     email :String,
//     name :String,
//     phone_no::String,
//     city :String,
//     state :String,
//     travel_history:Boolean
// };
//
// const Patient= mongoose.model("Patient",patients);
// const Registeredshop= mongoose.model("Registeredshop",shop_register);
// const Shop= mongoose.model("Shop",shops);
// const Disease= mongoose.model("Disease",diseases);
//
// app.use(function(req, res, next) {
//     res.locals.error = req.flash("error");
//     res.locals.success = req.flash("success");
//     next();
// });

app.get('/', function(req, res){
  var q= "select state,count(*) as state_count from patients group by state,travel_history having travel_history = true;";
  Connection.query(q, function(err, results) {
      if (err) {
          req.flash("error", "Error to load home page!");
          res.redirect("back");
      } else {
        console.log(results);
         res.render('home',{results: results});}
});
});

app.get('/home', function(req, res) {
    var q = "select count(*) as count from patients where travel_history=false;select count(*) as count from patients where travel_history=true;select * from shop_register order by shop_id asc;";
    Connection.query(q, function(err, results) {
        if (err) {
            req.flash("error", "Error to load home page!");
            res.redirect("back");
        } else {
        /*  console.log(JSON.stringify(results[0],null,4) );
          const obj = {...results[0][0]}; console.log(obj.count);*/
          console.log(results[1][0].count);// console.log('second:',results[1].count2);
            res.render("submit", { results: results });
        };
    });
});


//app.get('/', (req, res) => res.send('Hello World!'));
app.post("/register", function (req, res) {

    const q = {
      email: req.body.email,
      name: req.body.name,
      phone_no: req.body.phoneNumber,
      city: req.body.city,
      state:req.body.state
    };
     const w = {
    patient_email: req.body.email,
    symptoms:'none'
     }
     const v = {
       customer_email: req.body.email,
       shop_no: req.body.shopNumber,
     }
  if (req.body.travelHistory == 'on') {
    q.travel_history = true;
    v.travel_history = true;
  }
  else if (req.body.travelHistory == 'off') {
    q.travel_history = false;
    v.travel_history = false;
  }
    Connection.query("insert into patients set ?", q, function(err, patient_results) {
      if (err) {
        // checking if User is already registered!
        console.log(err);
        req.flash("error", "User is already registered!");
        res.redirect("back");
      } else {
        // if not first add data in patients and then in shops
        Connection.query("insert into shops set ?", v, function (err, shop_results) {
          if (err) {
            console.log(err);
            req.flash("error", "error occured");
            res.redirect("back");
          }
          else {
            // after adding data in shops check travel history
            //  if yes then go to symptoms
            if (q.travel_history == true) {
              console.log(patient_results);
              req.flash("success", "Thank you for registering! Enter more details for safety check");
              res.render("symptoms", { qemail: q.email });
            }
            else {
              // if no then directly enter into diseses
              Connection.query("insert into diseases set ?", w, function (err, disease_results) {
                if (err) {
                  console.log(err);
                  req.flash("error", "error occured");
                  res.redirect("back");
                }
                else {
                  req.flash("success", "you are low risk! please stay at home!");
                  res.redirect('/home');
                }
              });
            }
          }
        });
      }
    })
});


app.get('/symptoms', (req, res) => {
  res.render('symptoms');
})

app.post('/symptoms', (req, res) => {
  var q = {
    patient_email: req.body.email,
    symptoms: req.body.symptoms
  }
  Connection.query("insert into diseases set ?", q, function (err, results) {
    if (err) {
      console.log(err);
      req.flash("error", "User is already registered!");
      res.redirect("back");
    } else {
      req.flash("success", "Please visit nearest doctor for checkup!");
      res.redirect('/');
    }
  })
});


app.get('/shopregister', (req, res) => {
  res.render('shop_reg');
})

app.post('/shopregister', (req, res) => {
  var x = {
    shop_id: req.body.shop_id,
    shop_name: req.body.shop_name
  }
Connection.query("insert into shop_register set ?", x, function (err, results) {
       if (err) {
                 console.log(err);
                 req.flash("error", "shop is already registered!");
                 res.redirect("back");
                      }
      else {
                req.flash("success", "shop is successfully registered");
                         res.redirect('/');
             }
});
});

app.listen(3300, function(req, res) {
    console.log("Server started");
});
