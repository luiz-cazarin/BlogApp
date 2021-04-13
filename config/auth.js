// Arquivo reponsavel por estruturar o sistema de autentificacao


// carregando a estrategia de autentificacao
const localStrategy = require('passport-local').Strategy
// carregando o mongoose
const mongoose =  require('mongoose')
// carregando o bcrypt (vamos comparar senhas)
const bcrypt = require('bcryptjs')

// Model de usuario
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

// Aqui dentro configuramos o sentema de autentificacao
module.exports = function(passport){
    // aqui passamos o campo que queremos analizar
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done)=>{
        // pesquisando um usuario que tem o email igual ao que foi passado na autentificacao
        Usuario.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                // done e uma funcao de callback
                // done - 3 parametros (dados da conta autenticada, sucesso ou nao, mensagem)
                return done(null, false, {message: "Esta conta nao existe"})
            }
            //  Comparando 2 valores encriptados
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                
                if(batem){
                    return done(null, usuario)
                }else{
                    return  done(null, false, {message: "Senha incorreta"})
                }
            })

        })

    }))

    // salvando os dados de um usuario na sessao
    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    //procurando um usuario pelo id dele
    passport.deserializeUser((id, done)=>{
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })

}