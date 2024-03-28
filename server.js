const express = require("express");
const stripe = require("stripe")(
  "***********"
);
const app = express();

//for test payment
// note in stripe for test payment we dont need demo account created on stripe, instead you can use any 
//email with demo/test card information as card no = 4242 4242 4242 4242, MM /YY = 11 / 24, CVC = 123.
// user/customer demo account = sb-f943jk28159168@personal.example.com
// user/customer demo account passwod = My*pass0***

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/create-checkout-session", async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Computer Desk",
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    // success_url: `http://localhost:4000/success`, //simple success route
    success_url: "http://localhost:4000/success?session_id={CHECKOUT_SESSION_ID}", //optional to store data in database once successful. 
    cancel_url: "http://localhost:4000/cancel",
  });

  console.log("server session", session);
  // note as we also have session.url the url of checkout page we can send url in response to frotend and instead of const { error } = await stripe.redirectToCheckout({.. we can use window.location.href = session.url in frontend
  res.status(201).json({ id: session.id });
});

app.get("/success", async (req, res) => {
  console.log("req.query", req.query);
  const sessionId = req.query.session_id;
  // optional Retrieve session details from Stripe using the session ID like 
  //now if you want you can save info in database
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log("/success session=", session, "customer_details =-", session.customer_details, "payment_status =-", session.payment_status);

  res
    .status(200)
    .send('<h1>Payment Successful!</h1> <br/> <a href="/">Back</a>');
});

app.get("/cancel", (req, res) => {
  res.status(200).send('<h1>Payment Canceled</h1> <br/> <a href="/">Back</a>');
});

app.listen(4000, () => {
  console.log("server is running on port 4000");
});
