
function request(req){
const result = await fetch(`https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
  query {
    locks {
      address
    }
}
}`
  }),
}).then((res) => res.json());
return result
}
export default request()