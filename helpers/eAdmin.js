// helpers sao pequenas funcoes que ajudam em algo
// Objetivo: Verificar se o usuario esta autenticado e se ele e Adm

module.exports = {
    eAdmin: function(req, res, next) {
        // funcao gerada pelo passport
        // verifica se um usuario esta autenticado E se ele e admin
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            // continua
            return next();
        }

        req.flash("error_msg", "Voce precisa ser um Admin para ter acesso!")
        res.redirect("/")
    }
}
