import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import {Pool} from 'pg'

const pool = new Pool({
    database: 'photo_album_db',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'guchigov198609'
})


const app = express()

app.use(express.json())
app.use(cors())
app.use('/uploads', express.static('uploads'))


const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = 'uploads';
        try {
            await fs.access(uploadDir)
        } catch (error) {
            await fs.mkdir(uploadDir, {recursive: true})
        }
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})


const upload = multer({ storage })

app.get('/photos', async(req, res)=>{
    try {
        const { rows } = await pool.query('SELECT * FROM photos ORDER BY id DESC')
        res.json(rows) 
    } catch (error) {
        res.status(500).json({error: 'Ошибка сервера get'})
    }
})


app.get('/photos/:id', async(req, res)=>{
    try {
        const id = Number(req.params.id)
        const {rows} = await pool.query('SELECT * FROM photos WHERE id = $1', [id])

        if(rows.length === 0){
            return res.status(404).json({error: 'Фото не найдена'})
        }

        res.json(rows[0])
    } catch (error) {
        res.status(500).json({error: 'Ошибка сервера get/id'})
    }
})

app.post('/photos', upload.single('image'), async(req, res)=>{
    try {
        const {title} = req.body
        const file = req.file

        if(!title || !file){
            return res.status(400).json({error: 'Заполните все поля'})
        }

        const photosURL = `/uploads/${file.filename}`

        const {rows} = await pool.query('INSERT INTO photos(title, image_url) VALUES ($1, $2) RETURNING *', [title, photosURL])
        res.json(rows[0])
    } catch (error) {
        res.status(500).json({error: 'Ошибка сервера get/post'})
    }
})


app.put('/photos/:id', upload.single('image'), async(req, res)=>{
    try {
        const id = Number(req.params.id)
        const {title} = req.body
        const file = req.file

        if(!title || !file){
            return res.status(400).json({error: 'Заполните все поля'})
        }

        const { rows } = await pool.query('SELECT * FROM photos WHERE id = $1', [id])
        if(rows.length === 0){
            return res.status(400).json({error: 'Фото не найден'})
        }

        let photosURL = rows[0].image_url;

        if(file){
            try {
                const oldFilePath = photosURL.replace('/uploads', 'uploads/')
                await fs.access(oldFilePath)
                await fs.unlink(oldFilePath)
                console.log('Старый файл удален')
            } catch (error) {
                console.log('Стараый файл не найден, пропускаем')
            }

            photosURL = `/uploads/${file.filename}`
            console.log('Новый файл: ', photosURL)
        }

        const result = await pool.query('UPDATE photos SET title = $1, image_url= $2 WHERE id = $3 RETURNING *', [title, photosURL, id])
        res.json(result.rows[0])


    } catch (error) {
        res.status(500).json({error: 'Ошибка в сервере put'})
    }
})


app.delete('/photos/:id', async( req, res)=>{
    try {
        const id = Number(req.params.id)
        const {rows} = await pool.query('SELECT * FROM photos WHERE id = $1', [id])

        if(rows.length === 0){
            return res.status(404).json({error: 'Фото не найден'})
        }

        const photo = rows[0]
        const filePath = photo.image_url.replace('/uploads/', 'uploads/')

        try{ 
            await fs.access(filePath)
            await fs.unlink(filePath)
        }catch(error){
            console.error(`ОШибка при удалении файла: `, error)
        }

        await pool.query('DELETE FROM photos WHERE id = $1', [id])
        res.json({message: 'Продукт удалена'})
    } catch (error) {
        res.status(500).json({error: 'ошибка сервера delete'})
    }
})

app.listen(3000, ()=>{
    console.log('Сервер запущен')
})


