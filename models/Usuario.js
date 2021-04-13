const mongoose =  require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: 'String',
        require: true
    },
    email: {
        type: 'String',
        require: true
    },
    eAdmin: {
        type: 'Number',
        default: 0
    },
    // Precisamos hashear a senha, instalamos o bcrypt na pasta do projeto
    senha: {
        type: 'String',
        require: true
    }

})

mongoose.model("usuarios", Usuario)

