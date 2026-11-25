import { useDebugValue } from "react";
import { useAppSelector } from "../hooks/useAppSelector";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Photo, removePhoto, selectPhoto } from "../store/photosSlice";

export function PhotoList(){
    const photos = useAppSelector((state) => state.photos.photos)
    const dispatch = useDispatch()

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить эту фотку?')){
            return
        }
          
        try {
            await axios.delete(`http://localhost:3000/photos/${id}`)
            dispatch(removePhoto(id))
        } catch (error) {
            console.error('ошибка прри удалении: ', error)
        }
    }
    const handleEdit = (photo: Photo)=>{
        dispatch(selectPhoto(photo))
    }


    return (
        <div>
            {photos.map(photo => (
                <div key={photo.id}>
                    <img src={`http://localhost:3000${photo.image_url}`} style={{width: '100px', height: '100px'}} alt={photo.title}/>
                    <h3>{photo.title}</h3>
                    <button onClick={()=> handleEdit(photo)}>Редактировать</button>
                    <button onClick={()=> handleDelete(photo.id)}>Удалить</button>
                </div>
            ))}
        </div>
    )
}