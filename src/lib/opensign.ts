import axios from "axios";

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "https://sandbox.opensignlabs.com/api/v1/getuser",
  headers: {
    Accept: "application/json",
    "x-api-token": "<x-api-token>",
  },
};

axios
  .request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
