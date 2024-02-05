require('dotenv').config();

const nodemailer = require('nodemailer');
const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");
const express = require('express');
const app = express();

var tools = require('./tools');
var moment = require('moment');

var contador = 0;
var inicialLista = 0;
var finalLista = 0;
var midRespuesta = 0;
var init_lineas = 0;
var lineas = 0;

var users = new Map()
var mails = new Map()

var timer = null;
var timer2 = null;


app.get('/',(req,res)=>(res.send('Hello World3')));

app.listen(process.env.PORT,()=>{
  console.log("Aplicación running en puerto: " + process.env.PORT);
});


function setTimer()
{
    timer = setInterval(async function(){

        let respuesta = await get_mitma();

        if(respuesta != "Error"){
            lineas = get_lineas(respuesta);
        }
        
        if (lineas != init_lineas && lineas > 0){
            clearInterval(timer);
            setTimer2(lineas);
            console.log("FIN");
            
        }

        }, 20000);
}

function setTimer2(lineas)
{
    contador = 0;

    try
    {
        for (let [key, value] of mails) 
        {
            enviarCorreo(key);
        }
        
    }
    catch(err)
    {
        console.log("Correo no enviado");              
    }

    timer2 = setInterval(async function(){

        sumar();

        if(contador<8)
        {

            for (let [key, value] of users) 
            {
                bot.sendMessage(key,"¡¡¡La página ha cambiado!!!").catch(err=>{
                    if(err.response.statusCode==403){
                        deleteUser(key,value);
                    }               
                });
            }
        }
        else
        {
            init_lineas = lineas;
            clearInterval(timer2);
            setTimer();
        }

        }, 5000);
}

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
const mitma = process.env.WEB;


async function init() {
    contador = 0;
    let respuesta = await get_mitma();
        if(respuesta != "Error"){
            init_lineas = get_lineas(respuesta);
            lineas = init_lineas;
        }
    setTimer();
}

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
        return "Error";
    }
  }

function get_lineas(respuesta){

        if(respuesta != "Error"){
            inicialLista = respuesta.indexOf("<ul class='listado_generico'>")+1; // -1
            finalLista = respuesta.indexOf("</ul>",inicialLista)+1;
            midRespuesta = respuesta.substring(inicialLista,finalLista+1);
            lineas = midRespuesta.split('</li>').length-1;
            return lineas;
        }
        else
        {
            return 0;
        }

    }

function enviarCorreo(destino){

    if(destino != ""){

        let mailTransporter =
        nodemailer.createTransport(
            {
                service: 'gmail',
                auth: {
                    user: process.env.FROMAIL,
                    pass: process.env.PWDMAIL
                }
            }
        );
    
        let mailDetails = {
            from: 'Gabriel',
            to: destino,
            subject: 'IAS - Página actualizada - ' + moment().format('DD/MM/YYYY HH:mm:ss'),
            text: 'Página del cuerpo de IAS actualizada.' + "\n\r" + mitma
        };


        mailTransporter
        .sendMail(mailDetails,
            function (err, data) {
                if (err) {
                    console.log('Error Occurs');
                } else {
                    console.log('Email sent successfully');
                }
            });

    }
}

function login(nUser,name, from){

    if(from==0){
        texto = "Bienvenid@ " + name + "\n\r" + "\n\r";
    }
    else
    {
        texto = "";
    }

    if(addUser(nUser,name)){
        texto = texto + "Su número de usuario es el " + nUser + " y recibirá una notificación cuando haya cualquier modificación en la página del MITMA.";
        texto = texto + "\n\r" + "\n\r" + "Si desea no recibir ninguna notificación, escriba /logout.";
        bot.sendMessage(nUser,texto);
    }
    else
    {
        bot.sendMessage(nUser,"Ninguna acción llevada a cabo. Ya se encontraba suscrit@ a las notificaciones.");
    }

}

function logout(nUser,name){

    if(deleteUser(nUser,name))
    {
        bot.sendMessage(nUser,"Ya no se encuentra suscrit@ a las notificiaciones.");
        bot.sendMessage(nUser, "Si desea volver a recibir alguna notificación, escriba /login.");
    }
    else
    {
        bot.sendMessage(nUser,"Ninguna acción llevada a cabo. Ya se encontraba no suscrit@a a las notificaciones.");
    }
}

function addMail(nUser, chatId){
    if(mails.has(nUser)==false){
        mails.set(nUser,1);
        console.log("Added mail " + nUser);
        bot.sendMessage(chatId,"Añadido " + nUser);
        return true;
    }
    else
    {
        console.log("Mail " + nUser + " already exists");
        bot.sendMessage(chatId, nUser + " ya existe");
        return false;
    }
}

function deleteMail(nUser,chatId){
    if(mails.has(nUser)==true){
        mails.delete(nUser);
        console.log("Deleted mail " + nUser);
        bot.sendMessage(chatId,"Borrado " + nUser);
        return true;
    }
    else
    {
        console.log("Mail " + nUser + " already deleted");
        bot.sendMessage(chatId, nUser + " ya estaba borrado");
        return false;
    }
}


function addUser(nUser,name){
    if(users.has(nUser)==false){
        users.set(nUser,name);
        console.log("Added user " + nUser + " (" + name + ")");
        return true;
    }
    else
    {
        console.log("User " + nUser + " already exists");
        return false;
    }
}

function deleteUser(nUser,name){
    if(users.has(nUser)==true){
        users.delete(nUser);
        console.log("Deleted user " + nUser + " (" + name + ")");
        return true;
    }
    else
    {
        console.log("User " + nUser + " already deleted");
        return false;
    }
}

function getusers(nUser){

    if(users.size>0){

        texto = "Usuarios: " + "\n\r";

        for (let [key, value] of users) 
        {
            texto = texto + "\n\r" + "Id: " + key + " (" + value + ")";
        }   
        
        bot.sendMessage(nUser,texto);
    }
    else
    {
        texto = "Actualmente no hay ningún usuario suscrito a las notificaciones.";
        bot.sendMessage(nUser,texto);
    }
}

function getMails()
{
    var texto4="";

    for (let [key, value] of mails) 
    {
        if(texto4==""){
            texto4 = key;
        }
        else
        {
            texto4 = texto4 + ";" + key;
        }
    }

    return texto4;
}

function sumar()
{
    contador = contador + 1;
};

const bot = new TelegramBot(token, { polling: true});

bot.on("message",async(msg)=>{
    
    const chatId= msg.chat.id;
    const userInput = msg.text;
    const name = msg.from.first_name;

    if(userInput == "/start")
    {
        login(chatId,name,0);
    }
    else if(userInput == "/status")
    {
        texto = "Actualmente en la página web hay " + lineas + " elementos."
        bot.sendMessage(chatId,texto);
    }
    else if(userInput == "/login")
    {
        login(chatId,name,1);
    }
    else if(userInput == "/logout")
    {
        logout(chatId,name,1);
    }
    else if(userInput == "/users")
    {
        getusers(chatId);
    }
    else if(userInput == "/test")
    {
        init_lineas = 0;
        bot.sendMessage(chatId,"A continuación todos los usuarios conectados recibirán una alerta.");
    }
    else if(userInput.startsWith("/addmail"))
    {
        var texto1 = (userInput.replace("/addmail","").replace(" ",""));
        texto1 = texto1.split(";")
        if(texto1.length>0){
            for (let i = 0; i < texto1.length; i++) {
                if(checkEmail(texto1[i])){
                    addMail(texto1[i],chatId);
                }
              } 
        }
    }
    else if(userInput.startsWith("/delmail"))
    {
        var texto2 = (userInput.replace("/delmail","").replace(" ",""));
        texto2 = texto2.split(";")
        if(texto2.length>0){
            for (let i = 0; i < texto2.length; i++) {
                if(checkEmail(texto2[i])){
                    deleteMail(texto2[i],chatId);
                }
              } 
        }
    }
    else if(userInput == "/listmails")
    {
        var texto3 = "Mails: " + "\n\r";

        for (let [key, value] of mails) 
        {
            texto3 = texto3 + "\n\r" + key;
        }
        
        bot.sendMessage(chatId,texto3);

    }
    else if(userInput == "aa")
    {
        for (let [key, value] of mails) 
        {
            enviarCorreo(key);
        }
    }   

});

//check the email
function checkEmail(str) {
    var pattern = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
    if (pattern.test(str)) {
        return true;
    } else {//from   ww  w  . jav  a2 s.  c  o m
        return false;
    }
}

init();