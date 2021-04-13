const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model("usuarios")
const bcrypt = require('bcryptjs')
const passport = require('passport')




router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({texto: "Email invalido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({texto: "Senha invalido"})
    }

    if(req.body.senha.length < 4) {
        erros.push({texto: "Senha Muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas sao diferentes, tente novamente"})
    }

    if(erros.length >0){
        res.render("usuarios/registro", {erros: erros})
       

    } else {
        // Verificando se o usuario ja existe no bd
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Ja existe uma conta com este e-mail")
                res.redirect("/usuarios/registro")
                console.log("erro")
            }else{
                // Criando um novo Usuario, passando os dados do html para a constante(obj) novo Usuario
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                //Encriptar a senha antes de salvar
                //Usamos o bcrypt
                //Quando eu coloco um salt em sima do valor ele fica "aleatorio" ex: lsdjf23r2rflsejf
                bcrypt.genSalt(10, (erro, salt)=>{
                   //Gerando o hash, recebe 3 parametros, (senha, salt, (funcao de call-back))
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash)=>{
                        // Aqui dentro ele passa o valor hasheado
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                            res.redirect("/")
                        }
                        // senha do novo usuario vai ser igual a hash que foi gerada
                        novoUsuario.senha = hash
                        novoUsuario.save().then(()=>{
                            req.flash("success_msg", "Usuario criado com sucesso")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve ao criar o usuario")
                            res.redirect("/usuarios/registro")
                        })

                    })
                })

            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

        // Registrando o usuario
    }

})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

//carregar o passport no arquivo, autentificacao
router.post("/login", (req, res, next) => {
    // Usar essa funcoa sempre que eu quiser autetificar algo
    passport.authenticate("local", {
        // passar os 3 campos
        // Qual caminho que ele vai passar caso a autentificacao seja um sucesso
        successRedirect: "/",
        // Caso falhe
        failureRedirect: "/usuarios/login",
       // Abilitando as menssagens do tipo flash
        failureFlash: true
    })(req, res, next)
})

//  Passport e um midwere de autentificacao especifico para o express
//  diferentes formas de autentificacao (google etc)
//  vamos utilizar a estrategia  local  (passport-local), usamos o nosso proprio banco de dados
// Instalamos o passport na pasta do projeto (npm install --save passport)
// Instalar o projeto que vamos usaar (npm install --save passport-local)

module.exports = router
