// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "../.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server Has Started at PORT:${process.env.PORT}`);
    });
    app.on("error", () => {
      console.log("ERRR", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log(" DataBase Connection Failed!! ", err);
  });
  
/*   

// Not a Good Approach    , Insted  make a new DB folder , undr that folder write the connectDB code , and then import that code to here !!!!


const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NMAE}`);
    app.on("error", (error) => {
      console.log("Not able to Talk to Database");
    });
    app.listen(process.env.PORT, () => {
      console.log(`APP is Listening on  PORT : ${process.env.PORT}`);
    });
  } catch (error) {
    (console.log("Error"), error);
  }
})();

*/
