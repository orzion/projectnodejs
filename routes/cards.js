const express = require('express');
const {Card} = require("../modules/Card");
const _ = require("lodash");
const auth = require("../middlewares/auth");
const joi = require('joi');

const router = express.Router();

const cardShema = joi.object({
    name: joi.string().required().min(2) ,
    address: joi.string().required().min(2) ,
    description: joi.string().required().min(2) ,
    phone: joi.string().required().regex(/^0[2-9]\d{7,8}$/) ,
    image: joi.string().required()
});

const genCardNumber = async () =>{
    while(true){
        let rendomeNum = _.rendome(1000,999999);
        let card = await Card.findOne({cardNumber: rendomeNum});
        if(!card) return rendomeNum;
    }
}

router.post("/", auth, async (req,res)=>{
    try{
        const {error} = cardShema.validate(req.body);
        if(error) return res.status(400).send(error.message);

        let card = new Card(req.body);
        card.cardNumber = await genCardNumber();

        card.user_id = req.payload._id;
        await card.save()
        res.status(201).send(card);
    }
    catch(error){
        res.status(400).send("Error in post card");
    }
});

router.get("/my-cards", auth ,async (req,res)=>{
    try{
        const myCards = await Card.find({user_id: req.payload._id});
        res.status(200).send(myCards);
    }
    catch(error){
        res.status(400).send("Error in get user cards");
    }
});

router.get("/:id",auth,async (req,res)=>{
    try{
        let card = await Card.findOne({_id: req.params.id, user_id: req.payload._id});
        if(!card) return res.status(404).send("Card wes not found");
        res.status(200).send(card);
    }
    catch(error){
        res.status(400).send("Error in get specic card");
    }
});

router.put("/:id", auth, async (req,res)=>{
    try{
        const {error} = cardShema.validate(req.body);
        if(error) return res.status(400).send(error.message);

        let card = await Card.findOneAndUpdate({_id: req.params.id,user_id: req.payload._id}, req.body, {new: true});
        if(!card) return res.status(404).send("Card was not found");

        res.status(200).send(card);
    }
    catch(error){
        res.status(400).send("Error in put specic card");
    }
});

router.delete("/:id",auth, async (req,res)=>{
    try{
        const card = await Card.findOneAndRemove({_id: req.params.id, user_id: req.payload._id});
        if(!card) return res.status("Card was not found");
        res.status("Card was deleted");
    }
    catch(error){
        res.status(400).send("Error in delete card");
    }
});

router.get("/", auth , async (req,res)=>{
    try{
        let cards = await Card.find();
        res.status(200).send(cards);
    }
    catch(error){
        res.status("Error in get all cards");
    }
});

module.exports = router;