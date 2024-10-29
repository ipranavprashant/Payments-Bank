/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import axios from "axios";
import crypto from "crypto";

const app = express();

app.use(express.json());

app.post('/api/phonepay-payment', async (req, res) => {
    const merchantId = req.body.merchantId;
    const merchantTransactionId = req.body.merchantTransactionId;
    const merchantUserId = req.body.merchantUserId;
    const amount = req.body.amount * 100; //converting in rs
    // const redirectUrl = req.body.redirectUrl;
    // const redirectMode = req.body.redirectMode;
    const callbackUrl = req.body.callbackUrl;
    const mobileNumber = req.body.mobileNumber;
    // const paymentInstrumentType = req.body.paymentInstrument.type;

    const data = {
        merchantId: merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: merchantUserId,
        amount: amount,
        redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
        redirectMode: "POST",
        callbackUrl: callbackUrl,
        mobileNumber: mobileNumber,
        paymentInstrument: {
            type: "PAY_PAGE"
        }


    }

    const payload = JSON.stringify(data);
    const payloadBase64 = Buffer.from(payload).toString('base64');
    const covertedPayload = payloadBase64 + "/pg/v1/pay" + process.env.salt_key;

    const keyIndex = 1;
    const sha256payload = crypto.createHash('sha256').update(covertedPayload).digest('hex');
    console.log(sha256payload);

    const xVerify = sha256payload + "###" + keyIndex;

    const options = {
        method: 'post',
        url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
        headers: {
            accept: 'text/plain',
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify
        },
        data: {
            request: payloadBase64 //send the base64 encoded payload as thats what is mentioned in the phonpe doc
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        return res.redirect(response.data.data.intrumentResponse.redirectInfo.url); //based on the payload that you generated above
    } catch (err) {
        console.log("Error Completing the payment " + err);
    }
})

app.post("/api/status/:id", (req, res) => {
    const merchantTransactionId = res.req.body.transactionId;
    const merchantId = res.req.body.merchantId;


    const xVerify = "/pg/v1/status" + "/" + merchantId + "/" + merchantTransactionId + process.env.salt_key;
    const xVerifySHA256 = crypto.createHash('sha256').update(xVerify).digest('hex');
    const saltIndex = 1;
    const finalXVerify = xVerifySHA256 + "###" + saltIndex;

    const options = {
        method: 'get',
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'text/plain',
            'Content-Type': 'application/json',
            'X-VERIFY': finalXVerify,
            'X-MERCHANT-ID': merchantId
        },

    };
    axios
        .request(options)
        .then(function (response) {
            console.log(response.data);
            if (response.data.success === 'true') {
                // return res.json({ message: "Transaction Successful" })
                return res.redirect("http://localhost:3000/sucess");
            }
            else {
                // return res.json({ code: response.data.code, message: response.data.message })
                return res.redirect("http://localhost:3000/failure");
            }

        })
        .catch(function (error) {
            console.error(error);
        });
})

