import express from 'express';
import router from './routes/routes';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router);

app.listen(process.env.PORT || 8081, () => {
    console.log(`Server is running on port ${process.env.PORT || 8081}`);
});
