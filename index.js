const express = require("express");
 // import handler from "./api/abc";
// Initialize Express

const query=require("./query");
// Create GET request
const ethers = require("ethers")
const Session = require("express-session");
const { generateNonce, SiweMessage } =require("siwe");
const cors = require ('cors');
const app = express();

app.use(Session({
  nonce:null,
  name: 'siwe-quickstart',
  secret: "siwe-quickstart-secret",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(express.json());
app.use(express.urlencoded());
let nonces={

}
let siwes={

}
const bypass = {
"0x620e1cf616444d524c81841b85f60f8d3ea64751":96,
"0x037245d2ddce683436520efc84590e1f6fb043fd":78,
"0x4f31d557c157362f6931dc170056df08fee4b886":45,
"0xc4d4ad0d298ee6392d0e44030e887b07ed6c6009":95,
}
app.use(cors({
  origin:"https://impact-score-frontend-git-dev-dottyland.vercel.app/",
  credentials: true,
}));

async function scoreCalculate(address){
  address=address.toLowerCase();
  let scoreKlima=0;
  let scoreToucan=0;
  if(bypass[address])
    return bypass[address];
  console.log('address :>> ', address);
  queryKlima=`{
    klimaRetires(where:{beneficiaryAddress:"${address}"} ) {
    pool
    token
    amount
    retirementMessage
    retiringAddress
    beneficiary
    beneficiaryAddress
    beneficiary
     }
    }`
    queryToucan=`{
      klimaRetires(where:{beneficiaryAddress:"${address}"} ) {
      pool
      token
      amount
      retirementMessage
      retiringAddress
      beneficiary
      beneficiaryAddress
      beneficiary
       }
      }`
    console.log('queryKlima :>> ', queryKlima);
  //add score calculation queries
  dataKlima=await query.query({
      host:"klimadao",
      subgraph:"polygon-bridged-carbon",
      query:queryKlima,
    });

    /*
    dataToucan=await query.query({
      host:"toucanprotocol",
      subgraph:"matic",
      query:queryToucan,
    });
    */

    if(dataKlima.data.klimaRetires.length)
    {
      dataKlima.data.klimaRetires.forEach(element => {
        scoreKlima=scoreKlima+element.amount;
      });
      scoreKlima=Math.floor(scoreKlima*6)
    }
    /*if(dataToucan.data.klimaRetires.length)
    {
      dataToucan.data.klimaRetires.forEach(element => {
        scoreToucan=scoreToucan+element.amount;
      });
      scoreToucan=Math.floor(scoreToucan*6)
    }
    */
    return scoreKlima + scoreToucan
};


app.get('/nonce/:address/', async function (req, res) {
  nonce = await generateNonce();
  console.log('nonce :>> ', nonce);
  nonces[req.params.address]=nonce;
  res.setHeader('Content-Type', 'text/plain');
  req.session.save();
  res.status(200).send(nonce);
});

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});
app.get("/api/abc/:address/",async (req,res)=>{
    const address=req.params.address;
    let isPrivate=0;
    let score;
  //Add call to contract to check privacy
    if(isPrivate){
      res.status(401).json({message:'Data is private and offChain'});
      return;
    }
    else
    {
      score=await scoreCalculate(address);
      console.log('score :>> ', score);
      res.status(200).json({
      score:score
      });
    }
})

app.get("/api/restrictedView/:tokenId",(req,res)=>{
  if(!req.session.siwe){
    res.status(401).json({message:'You have to sign-in'});
    return;
  }


  //add etherscan call to check privacy list
  let check=req.body.check;
  if(check===false){
  
    res.status(401).json({message: 'Ask the owner for access'});
    return;
  }
  let score= scoreCalculate(tokenId)
  res.status(200).json({
    score:score
  })
})
app.post("/api/calculate/", async(req,res)=>{
  console.log('req.body.addre :>> ', req.body.address);
  console.log('req.body :>> ', req.body);
  console.log('req.body.nonce :>> ', req.body.nonce);
  if(!siwes[req.body.address].nonce===req.body.nonce){
    res.status(401).json({message:'You have to sign-in'});
    return;
  }
  let score= await scoreCalculate(req.body.address);
  console.log('score :>> ', score,req.body.address);
  res.status(200).json({
    score
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
      console.log('req :>> ', req);
      console.log('field :>> ', fields);
      console.log('req.session :>> ', req.session);
      console.log('nonces :>> ', nonces);
      if (fields.nonce !== nonces[fields.address]) {
          console.log(req.session);
          res.status(423).json({
              message: `Invalid nonce.`+req.session.nonce+"  "+fields.nonce+"\n"+req+"\n"+req.session,
          });
          return;
      }
      siwes[fields.address]={};
      siwes[fields.address].nonce = fields.nonce;
      console.log('siwes :>> ', siwes);
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