const express = require('express');
const PORT = process.env.PORT || 8080;
const app = express();
const router = express.Router();

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Hello World!"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});