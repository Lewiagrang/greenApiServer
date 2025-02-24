const express = require('express');
const whatsAppClient = require('@green-api/whatsapp-api-client');
const cors = require("cors");

const app = express();
const port = 80;

// Configure CORS
const corsOptions = {
    origin: '*', // Разрешить все домены
};

app.use(cors(corsOptions));
app.use(express.json());

let restAPI;

app.post('/setCredentials', async (req, res) => {
    const { idInstance, apiTokenInstance } = req.body;
    console.log(req.body);
    
    // Create a new instance of the REST API
    restAPI = whatsAppClient.restAPI({ idInstance, apiTokenInstance });
    
    console.log(`Credentials set: idInstance=${idInstance}, apiTokenInstance=${apiTokenInstance}`);
    res.send('Credentials set successfully');
});

app.get('/notifications', async (req, res) => {
    if (!restAPI) {
        return res.status(400).send('API not initialized. Please set credentials first.');
    }
    try {
        let response = await restAPI.webhookService.receiveNotification();
        if (response) {
            const { receiptId, body } = response; 
            res.json(body); 
            await restAPI.webhookService.deleteNotification(receiptId); 
        } else {
            res.status(204).send(); 
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving notifications');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
