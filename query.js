const axios = require("axios")
function request(req){
  url=`https://api.thegraph.com/subgraphs/name/`+req.host+`/`+req.name;
  let query=req.query;
  axios.post(url, {
    query: query,
  }).then((res) => {
    console.log('res :>> ', res);
    return res.data.data
  })
  .catch((error) => {
    console.error(error)
  })
}
export default request()