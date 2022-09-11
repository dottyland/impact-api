const express = require("express");
 // import handler from "./api/abc";
// Initialize Express
const app = express();
const query=require("query");
// Create GET request
async function scoreCalculate(address){
  //add score calculation queries
  score=address;
  return score;
};
app.use(Session({
  name: 'siwe-quickstart',
  secret: "siwe-quickstart-secret",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, sameSite: true }
}));

app.get('/nonce', async function (req, res) {
  req.session.nonce = generateNonce();
  res.setHeader('Content-Type', 'text/plain');
  res.status(200).send(req.session.nonce);
});

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.get("/api/abc/:address/",(req,res)=>{
    const address=req.params.address
    res.status(200).json({
        body: address,
        query: "request.query",
        cookies: "request.cookies",
      });
})
app.get("/api/restrictedView/:tokenId",(req,res)=>{
  if(!req.session.siwe){

    res.status(401).json({message:'You have to sign-in'});
    return;
  }
  //add etherscan call to check privacy list
  let check=req.body.check;
  if(check===false){
  
    res.status(422).json({message: 'Ask the owner for access'});
    return;
  }
  let score=await scoreCalculate(tokenId)
  res.status(200).json({
    score:score
  })
})
app.post('/verify', async function (req, res) {
  try {
      if (!req.body.message) {
          res.status(422).json({ message: 'Expected prepareMessage object as body.' });
          return;
      }

      let message = new SiweMessage(req.body.message);
      const fields = await message.validate(req.body.signature);
      if (fields.nonce !== req.session.nonce) {
          console.log(req.session);
          res.status(422).json({
              message: `Invalid nonce.`,
          });
          return;
      }
      req.session.siwe = fields;
      req.session.cookie.expires = new Date(fields.expirationTime);
      req.session.save(() => res.status(200).end());
  } catch (e) {
      req.session.siwe = null;
      req.session.nonce = null;
      console.error(e);
      switch (e) {
          case ErrorTypes.EXPIRED_MESSAGE: {
              req.session.save(() => res.status(440).json({ message: e.message }));
              break;
          }
          case ErrorTypes.INVALID_SIGNATURE: {
              req.session.save(() => res.status(422).json({ message: e.message }));
              break;
          }
          default: {
              req.session.save(() => res.status(500).json({ message: e.message }));
              break;
          }
      }
  }
});
// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});




module.exports = app;