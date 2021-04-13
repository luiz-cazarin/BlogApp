// arquivo principal
// carregando modulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routers/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagem')
const postagem = mongoose.model("postagens")
require('./models/Categoria')
const Categoria = mongoose.model("categorias")
const usuarios  = require('./routers/usuario')
const passport = require('passport')
require('./config/auth')(passport)

// configuracoes
    // Sessao
    app.use(session({
        secret: "cursodenode",
        resave: true,
        saveUninitialized: true
    }))

    // IMPORTANTE esta ordem 
    app.use(passport.initialize())
    app.use(passport.session())
    

    app.use(flash())
    // middleware
        app.use((req,  res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.erro_msg = req.flash("erro_msg")
            res.locals.error = req.flash("error")
            next()
        })
    // bodyParser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
          console.log("Conectado ao mongo")  
        }).catch(err => {
            console.log("Erro: "+err)
        })
    // public
        app.use(express.static(path.join(__dirname, "public")))

        app.use((req, res, next) => {
            console.log("oi eu sou um middleware")
            next()
        })
// rotas
    // informando pro app o local da rotas
    // quando eu crio um grupo de rotas, eu meio que passo um prefixo para essas rotas
    app.get('/', (req, res) => {
        postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
        
    })
    
    // pesquisando uma postagem pelo slug dela
    app.get('/postagem/:slug', (req, res) => {
        postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Esta postagem nao existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get('/categorias', (req, res)=>{
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err)=>{
            req.flash('error_msg', "Houve um erro interno ao listar as categorias")
            req.redirect("/")
        })
    })
    
    app.get("/categorias/:slug", (req, res)=>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            
            if(categoria){
                postagem.find({categoria: categoria._id}).lean().then((postagens)=>{
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err)=>{
                    req.flash("error_msg", "Erro ao listar o post")
                    res.redirect("/")
                })

            }else{
               
                req.flash("error_msg", "Esta categoria nao existe")
                res.redirect("/")
            }
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno ao carregar a pagina da categoria")
            res.redirect("/")
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
// outros
const PORT = 8081
// passando uma funcao de callback
app.listen(PORT, () => {
    console.log("Servidor rodando...")
})

