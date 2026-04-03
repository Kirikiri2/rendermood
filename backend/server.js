import 'dotenv/config'
import app from './src/app.js'

const PORT = 3000

app.listen(PORT, ()=>{
    console.log(`Server run on port ${PORT}`)
    console.log(`Server run on http://localhost:${PORT}`)
    console.log(`Swagger documentation on: http://localhost:3000/api/docs`)
})