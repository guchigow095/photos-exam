import { useDispatch } from "react-redux"
import { useAppSelector } from "../hooks/useAppSelector"
import React, { useEffect, useState } from "react"
import axios from "axios"
import reducer, { addPhoto, selectPhoto, updatePhoto } from "../store/photosSlice"

const PhotoForm = () =>{
    const selectedPhoto = useAppSelector(state => state.photos.selectedPhoto)
    const dispatch = useDispatch()

    const [title, setTitle] = useState('')
    const [cover, setCover] = useState<File | null>(null)
    const [ preview, setPreview] = useState<string>('')


    useEffect(()=>{
        if(selectedPhoto){
            setTitle(selectedPhoto.title);
            setCover(null)
            setPreview(`http://localhost:3000${selectedPhoto.image_url}`)
        }else{
            setTitle('')
            setCover(null)
            setPreview('')
        }
    }, [selectedPhoto])


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
        if( e.target.files && e.target.files[0]){
            const file = e.target.files[0]
            setCover(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if(!title.trim()){
            alert('Введите название фотки')
            return
        }
        try {
            const formData = new FormData()
            formData.append('title', title.trim())

            if(cover){
                formData.append('image', cover)
            }

            if(selectedPhoto){
                const response = await axios.put(`http://localhost:3000/photos/${selectedPhoto.id}`,
                    formData
                )
                dispatch(updatePhoto(response.data))
            }else{
                if(!cover){
                    return
                }
                const response = await axios.post('http://localhost:3000/photos', formData)
                dispatch(addPhoto(response.data))
            }


            if(preview.startsWith('blob:')){
                URL.revokeObjectURL(preview)
            }
            setTitle('')
            setCover(null)
            setPreview('')
            dispatch(selectPhoto(undefined))
        } catch (error) {
            console.error('ошибка при сохранении данных')
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <div>
                <p>Название:</p>
                <input type="text" value={title} onChange={(e)=> setTitle(e.target.value)} placeholder="Введите название"></input>
            </div>

            <div>
                <p>Фото:</p>
                <input type="file" accept="image/*" onChange={handleFileChange}/>
            </div>

            {preview && (
                <div>
                    <img src={preview} style={{width: '100px', height: '100px'}} alt='Фото'></img>
                </div>
            )}


            <button type="submit">
                {selectedPhoto ? 'Сохранить изменения' : 'Добавить продукт'}
            </button>
        </form>
    )
}

export default PhotoForm;
