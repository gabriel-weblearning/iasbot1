require('dotenv').config();


const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");


const express = require('express');

const app = express();

app.get('/',(req,res)=>(res.send('Hello World2')));

app.listen(process.env.PORT,()=>{
  console.log("Aplicación running en puerto: " + process.env.PORT);
});


var respuesta ="";
var filas=0;
var contador = 0;
var inicialLista = 0;
var finalLista = 0;
var midRespuesta = 0;
var init_lineas = 0;
var lineas = 0;
var lineas_timer = null;
var user_timer = null;

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
const mitma = "https://www.mitma.gob.es/informacion-para-el-ciudadano/empleo-publico/procesos-selectivos/convocatorias-2022/personal-funcionario-2022/cuerpo_de_ingenieros_aeronauticos";


async function init() {
    contador = 0;
    let respuesta = await get_mitma();
        if(respuesta != "Error"){
        inicialLista = respuesta.indexOf("<ul class='listado_generico'>")+1; // -1
        finalLista = respuesta.indexOf("</ul>",inicialLista)+1;
        midRespuesta = respuesta.substring(inicialLista,finalLista+1);
        init_lineas= midRespuesta.split('</li>').length-1;
        init_lineas = 30;
        lineas = 30;
        }
}

async function get_lineas(){

    let respuesta = await get_mitma();
    if(respuesta != "Error"){
    inicialLista = respuesta.indexOf("<ul class='listado_generico'>")+1; // -1
    finalLista = respuesta.indexOf("</ul>",inicialLista)+1;
    midRespuesta = respuesta.substring(inicialLista,finalLista+1);
    lineas = midRespuesta.split('</li>').length-1;
    return 1;
    }
    else
    {
        return 0;
    }

}

lineas_timer = setInterval(function(){
    get_lineas();
    contador = contador + 1;
    console.log(contador);

    }, 10000);


const bot = new TelegramBot(token, { polling: true});

bot.on("message",async(msg)=>{

    const chatId= msg.chat.id;
    const userInput = msg.text;

    if (userInput == "inicio")
    {
        console.log(lineas);
        bot.sendMessage(chatId,lineas);
        
        // timer = setInterval(function(){
        //     sumar();
        //     console.log(contador);
        //     bot.sendMessage(chatId,contador);
        //     }, 5000);
    }
    else if (userInput == "final")
    {
        console.log ("final");
        console.log (lineas);
        console.log  (msg.chat.id);
        //bot.sendMessage(chatId,lineas);
        //get_mitma().then((data) => console.log(data));


        // clearInterval(timer);
        // bot.sendMessage(chatId,"Timer stopped");      
    }

    else if (userInput == "leer")
    {
        console.log ("leer");
        console.log(respuesta);

        // clearInterval(timer);
        // bot.sendMessage(chatId,"Timer stopped");      
    }

    else if (userInput == "/start")
    {
        bot.sendMessage(chatId,"Bienvenid@ a IAS MITMA Bot");;      
    }
});


function sumar()
{
    contador = contador + 1;
};



 async function get_mitma() {
    try
    {
        const url = mitma;
        let response = await axios.get(url);
        //respuesta = response.data;
        return response.data;
    }
    catch(error)
    {
        console.log("Error");
        //respuesta = "ERROR";
        return "Error";
    }
  }

  init();