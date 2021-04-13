const express =  require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categoria")
const Categoria = mongoose.model("categorias") // carregando modulos
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

// router.get('/', function (req, res){

// })

router.get('/', (req, res) =>{
    res.render("admin/index")
})

router.get('/posts', (req, res) =>{
    res.send("Pagina de posts")
})



router.get('/categorias', (req, res) => {
    Categoria.find().sort({date: 'DESC'}).lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) =>{
        res.flash("erro_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
    
})

router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategorias")
})


router.post('/categorias/nova', (req, res) => {

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0) {
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect("/admin/categorias") // redirecionando para a pagina de categorias
        }).catch((err) => {
            req.flash("erro_msg", "Houve um erro ao salvar a categoria")
            res.redirect("/admin")
        })
    }
})

router.get("/categorias/edit/:id", (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
    }).catch((err) => {
        req.flash("erro_msg", "Essa categoria nao existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", (req, res) => {
    
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome // atribuindo o valor pelo valor do formulario de edicao
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            res.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("erro_msg", "Houve um erro interno ao salvar a edicao da categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })

})

router.post("/categorias/deletar", (req, res) => {
    Categoria.remove({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "categoria deletada com sucesso")
        req.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("erro_msg", "Houve um erro ao deletada a categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("erro_msg", "Houve um erro ao listar as postagens a categoria")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err) => {
        req.flash("erro_msg", "Houve um erro ao carregar a categoria")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", (req, res) => {
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria invalida, registre uma categoria"})
    }

    if(req.body.titulo.length == 0 | typeof req.body.titulo == undefined){
        erros.push({texto: "Titulo invalido"})
    }

    if (erros.length > 0){
        res.render("admin/addpostagens", {erros: erros})
    }else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("erro_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
            console.log("erro: "+err)
        })
    }
    
})

router.get("/postagens/edit/:id", (req, res) => {
    
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err) => {
            req.flash("erro_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("erro_msg", "Houve um erro ao carregar o formulario de edicao")
        res.redirect("/admin/postagens")
    })
    
})


router.post("/postagem/edit", (req, res) => {

    Postagem.findOne({_id: req.body.id}).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg","Editado com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("erro_msg", "Houve um erro ao salvar: "+err)
            res.redirect("/admin/postagens")
            console.log("erro:"+err)
        })


    }).catch((err) => {
        req.flash("erro_msg", "Houve um erro ao salvar a edicao: "+err)
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/deletar/:id", (req, res) =>{
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("erro_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})

module.exports = router
