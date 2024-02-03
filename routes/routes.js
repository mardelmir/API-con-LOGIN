const express = require('express')
const router = express.Router()
const axios = require('axios')

const users = require('../data/users')
const { generateToken, verifyToken } = require('../middlewares/authMiddleware')
const url = 'https://rickandmortyapi.com/api/character/'


router.get('/', (req, res) => {
    const loginForm = `
            <h1>Inicio</h1>
            <form action="/login" method="post" style="line-height: 2em">
                <label for="username">Usuario :</label>
                <input type="text" id="username" name="username" required><br>

                <label for="password">Contraseña :</label>
                <input type="password" id="password" name="password" required><br>

                <p><button type="submit">Iniciar sesión</button></p>
            </form>`;

    const loggedInForm = `
            <h2><a href="/search" style="text-decoration: none">Search</a></h2><br>
            <form action="/logout" method="post">
                <button type="submit">Cerrar sesión</button>
            </form>`

    !req.session.token ? res.send(loginForm) : res.send(loggedInForm)
})

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username == username && user.password == password)

    if (user) {
        const token = generateToken(user);
        req.session.token = token;
        res.redirect('/search');
    } else {
        res.status(401).send('<h1>Error de autenticación</h1><p>Credenciales incorrectas</p><a href="/"><button>Inicio</button></a>')
    }
})

router.get('/search', verifyToken, (req, res) => {
    const userId = req.user;
    const user = users.find((user) => user.id === userId);
    const search = `
    <h1>Inicio</h1>
    <form action="/inputValue" method="post" style="line-height: 2em">
        <label for="searchCharacter">Buscar personaje:</label>
        <input type="text" id="searchCharacter" name="searchCharacter" required><br>
        <p><button type="submit">Buscar</button></p>
    </form>
    <form action="/logout" method="post">
        <button type="submit">Cerrar sesión</button>
    </form>`

    user
        ? res.send(search)
        : res.status(401).send('<h1>Error de autenticación</h1><p>Usuario no encontrado</p><a href="/"><button>Inicio</button></a>');
})

//Ruta intermedia para sacar el valor del input de búsqueda de personaje
router.post('/inputValue', (req,res) => {
    const {searchCharacter} = req.body;
    res.redirect(`/character/${searchCharacter}`)
})

router.get('/character', verifyToken, async (req, res) => {
    try {
        const response = await axios.get(url)
        const characters = response.data.results

        res.json(characters)

    } catch (err) {
        res.status(500).json({ error: 'El servidor se ha estropeado' })
    }
})

router.get('/character/:nombre', verifyToken, async (req, res) => {
    const name = req.params.nombre
    const urlCharacter = `${url}?name=${name}`

    try {
        const response = await axios.get(urlCharacter)
        const foundCharacters = response.data.results

        if (foundCharacters) {
            res.send(`
            ${foundCharacters.map(character => `
            <div>
                <img src="${character.image}" alt="${character.name}">
                <h2>${character.name}</h2>
                <p>Species: ${character.species}</p>
                <p>Gender: ${character.gender}</p>
                <p>Status: ${character.status}</p>
                <p>Origin: ${character.origin.name}</p>
            </div>`).join('')}
            `)
        } else {
            res.status(404).json({ mensaje: 'Personaje no encontrado' })
        }
    } catch {
        res.status(500).json({ error: 'El servidor no ha encontrado el personaje' })
    }
})

router.post('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

router.use((req, res) => { res.status(404).send(`<h1>Página no encontrada</h1><a href="/"><button>Inicio</button></a>`) })

module.exports = router