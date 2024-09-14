import dotenv from "dotenv";

const envConfig = () => {
    dotenv.config({
        path: '../server/.env'
    })
}

export default envConfig;