const axios = require("axios")

const request=async(req)=>{
  url=`https://api.thegraph.com/subgraphs/name/`+req.host+`/`+req.subgraph;
  let query=req.query;
  const result= await axios.post(url, {
    query: query,
  }).then((res) => {
    console.log('res :>> ', res.data);
    return res;
  })
  .catch((error) => {
    console.error(error)
  })
  return result.data;
}
module.exports= {
  query:request,
}