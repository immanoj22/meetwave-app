
const Envname = "local";

export const ADDRESS_KEY = process.env.REACT_APP_GOOGLE_ADDRESS_KEY
// console.log("config_GOOGLE_ADDRESS_KEY",process.env.REACT_APP_GOOGLE_ADDRESS_KEY,process.env.REACT_APP_SECRET_KEY,process.env.REACT_APP_DecryptKey);
let key = {};
key.KEY = process.env.REACT_APP_SECRET_KEY;
key.ONEDAYINSECONDS = 0;
key.BLOCKS_PER_YEAR = 0;
key.SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
key.DecryptKey = process.env.REACT_APP_DecryptKey;
key.AWS_CDN_URL = process.env.REACT_APP_CDN_URL
key.RPAD_ADDRESS = "";
key.ROUTER = "";
key.EMAIL = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
key.MOBILE = /^\d{10}$/;
key.NumOnly = /^\d+$/;
key.PASSWORD = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
key.OnlyAlbhabets = /^(?:[A-Za-z]+)(?:[A-Za-z0-9 _]*)$/;
key.notSpecil = /^[a-zA-Z-9]+$/;
key.OnlyAlphSpecial = /^[A-Za-z_@.#&+-]*$/;
key.limit = 50;
key.NumDigitOnly = /[^0-9\.]/g;
key.NumberOnly = /[^0-9]/g;

if (Envname === "local") {
  key.COMMON_URL = "http://localhost:8008/v1";
  key.BACK_URL = "http://localhost:8008/v1/user";
  key.ADMIN_URL = "http://localhost:8008/v1/admin";
  key.IMG_URL = "http://localhost:8008";


} else if (Envname === "demo") {
  key.COMMON_URL = "http://localhost:8008/v1";
  key.BACK_URL = "http://localhost:8008/v1/user";
  key.ADMIN_URL = "http://localhost:8008/v1/admin";
  key.IMG_URL = "http://localhost:8008";


} 
else if (Envname === "staging") {
  key.COMMON_URL = "http://localhost:8008/v1";
  key.BACK_URL = "http://localhost:8008/v1/user";
  key.ADMIN_URL = "http://localhost:8008/v1/admin";
  key.IMG_URL = "http://localhost:8008";
}

export default key;
